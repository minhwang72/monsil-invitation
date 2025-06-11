import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { encryptPassword } from '@/lib/crypto'

interface MySQLError extends Error {
  code?: string
}

interface MySQLUpdateResult {
  affectedRows: number
}

export async function POST() {
  try {
    const migrations = []
    
    // 1. guestbook 테이블에 deleted_at 컬럼 추가
    try {
      await pool.query(`
        ALTER TABLE guestbook 
        ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
      `)
      migrations.push('guestbook: deleted_at column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('guestbook: deleted_at column already exists')
      } else {
        throw error
      }
    }

    // 2. gallery 테이블 생성 (존재하지 않는 경우)
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gallery (
          id INT AUTO_INCREMENT PRIMARY KEY,
          url VARCHAR(500) DEFAULT NULL,
          filename VARCHAR(255) DEFAULT NULL,
          base64_data LONGTEXT DEFAULT NULL,
          image_type ENUM('main', 'gallery') DEFAULT 'gallery',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL
        )
      `)
      migrations.push('gallery table created or already exists')
    } catch (error) {
      console.error('Gallery table creation error:', error)
      throw error
    }

    // 3. gallery 테이블에 image_type 컬럼 추가 (이미 존재하는 테이블의 경우)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN image_type ENUM('main', 'gallery') DEFAULT 'gallery'
      `)
      migrations.push('gallery: image_type column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: image_type column already exists')
      } else {
        // 테이블이 이미 있고 컬럼도 있는 경우 무시
        console.log('Gallery image_type column migration skipped:', mysqlError.message)
      }
    }

    // 4. gallery 테이블에 deleted_at 컬럼 추가
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL
      `)
      migrations.push('gallery: deleted_at column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: deleted_at column already exists')
      }
    }

    // 4-1. gallery 테이블에 filename 컬럼 추가 (기존 테이블에 없을 경우)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN filename VARCHAR(255) NOT NULL DEFAULT ''
      `)
      migrations.push('gallery: filename column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: filename column already exists')
      } else {
        console.log('Gallery filename column migration skipped:', mysqlError.message)
      }
    }

    // 4-2. gallery 테이블에서 url 컬럼 제거 (filename 사용으로 변경)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        DROP COLUMN url
      `)
      migrations.push('gallery: url column removed (using filename instead)')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        migrations.push('gallery: url column already removed')
      } else {
        console.log('Gallery url column removal skipped:', mysqlError.message)
      }
    }

    // 4-3. gallery 테이블에 base64_data 컬럼 추가 (base64 이미지 저장용)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN base64_data LONGTEXT DEFAULT NULL
      `)
      migrations.push('gallery: base64_data column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: base64_data column already exists')
      } else {
        console.log('Gallery base64_data column migration skipped:', mysqlError.message)
      }
    }

    // 4-4. gallery 테이블에서 base64_data 컬럼 제거 (파일 기반 저장으로 변경)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        DROP COLUMN base64_data
      `)
      migrations.push('gallery: base64_data column removed (using file storage instead)')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        migrations.push('gallery: base64_data column already removed')
      } else {
        console.log('Gallery base64_data column removal skipped:', mysqlError.message)
      }
    }

    // 5. 메인 이미지 트리거 제거 (문제 발생으로 인해)
    try {
      await pool.query(`DROP TRIGGER IF EXISTS enforce_single_main_image`)
      migrations.push('main image constraint trigger removed (handled in app logic)')
    } catch (error) {
      console.error('Trigger removal error:', error)
      migrations.push('trigger removal failed (non-critical)')
    }

    // 6. contacts 테이블 생성
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          side ENUM('groom', 'bride') NOT NULL,
          relationship ENUM('person', 'father', 'mother') NOT NULL,
          name VARCHAR(50) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_side (side),
          INDEX idx_relationship (relationship)
        )
      `)
      migrations.push('contacts table created or already exists')
    } catch (error) {
      console.error('Contacts table creation error:', error)
      throw error
    }

    // 7. contacts 테이블에 은행명과 계좌번호 컬럼 추가
    try {
      await pool.query(`
        ALTER TABLE contacts 
        ADD COLUMN bank_name VARCHAR(50) NULL DEFAULT NULL
      `)
      migrations.push('contacts: bank_name column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('contacts: bank_name column already exists')
      } else {
        throw error
      }
    }

    try {
      await pool.query(`
        ALTER TABLE contacts 
        ADD COLUMN account_number VARCHAR(50) NULL DEFAULT NULL
      `)
      migrations.push('contacts: account_number column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('contacts: account_number column already exists')
      } else {
        throw error
      }
    }

    // 8. contacts 테이블에 초기 데이터 삽입 (계좌 정보 포함)
    try {
      // 기존 데이터가 있는지 확인
      const [existingRows] = await pool.query('SELECT COUNT(*) as count FROM contacts')
      const typedRows = existingRows as { count: number }[]
      const count = typedRows[0].count
      
      if (count === 0) {
        // 초기 연락처 데이터 삽입 (계좌 정보 포함)
        const contactsData = [
          ['groom', 'person', '황민', '01036986181', '카카오뱅크', '3333-17-5074857'],
          ['groom', 'father', '황현기', '01030666181', '농협', '302-0123-4567-11'], 
          ['groom', 'mother', '박인숙', '01042526181', '국민은행', '123-456-789012'],
          ['bride', 'person', '이은솔', '01089390389', '신한은행', '110-123-456789'],
          ['bride', 'father', '이완규', '01045990389', '우리은행', '1002-123-456789'],
          ['bride', 'mother', '홍순자', '', '하나은행', '333-123456-78901']
        ]
        
        for (const contact of contactsData) {
          await pool.query(
            'INSERT INTO contacts (side, relationship, name, phone, bank_name, account_number) VALUES (?, ?, ?, ?, ?, ?)',
            contact
          )
        }
        migrations.push('initial contact data with account info inserted')
      } else {
        // 기존 데이터가 있으면 계좌 정보만 업데이트
        const accountUpdates = [
          [1, '카카오뱅크', '3333-17-5074857'], // 황민
          [2, '농협', '302-0123-4567-11'],     // 황현기
          [3, '국민은행', '123-456-789012'],    // 박인숙
          [4, '신한은행', '110-123-456789'],    // 이은솔
          [5, '우리은행', '1002-123-456789'],   // 이완규
          [6, '하나은행', '333-123456-78901']   // 홍순자
        ]
        
        for (const [id, bankName, accountNumber] of accountUpdates) {
          await pool.query(
            'UPDATE contacts SET bank_name = ?, account_number = ? WHERE id = ?',
            [bankName, accountNumber, id]
          )
        }
        migrations.push('account information updated for existing contacts')
      }
    } catch (error) {
      console.error('Contact data insertion/update error:', error)
      migrations.push('contact data insertion/update failed (non-critical)')
    }

    // 9. 사용하지 않는 accounts 테이블 삭제
    try {
      await pool.query('DROP TABLE IF EXISTS accounts')
      migrations.push('accounts table dropped (unused)')
    } catch (error) {
      console.error('Accounts table drop error:', error)
      migrations.push('accounts table drop failed (non-critical)')
    }

    // 10. 사용하지 않는 invitations 테이블 삭제
    try {
      await pool.query('DROP TABLE IF EXISTS invitations')
      migrations.push('invitations table dropped (unused)')
    } catch (error) {
      console.error('Invitations table drop error:', error)
      migrations.push('invitations table drop failed (non-critical)')
    }

    // 11. contacts 테이블에 kakaopay_link 컬럼 추가
    try {
      await pool.query(`
        ALTER TABLE contacts 
        ADD COLUMN kakaopay_link VARCHAR(255) NULL DEFAULT NULL
      `)
      migrations.push('contacts: kakaopay_link column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('contacts: kakaopay_link column already exists')
      } else {
        throw error
      }
    }

    // 12. 황민의 카카오페이 링크 업데이트
    try {
      await pool.query(
        'UPDATE contacts SET kakaopay_link = ? WHERE name = ? AND side = ?',
        ['https://qr.kakaopay.com/Ej7nPOau3', '황민', 'groom']
      )
      migrations.push('황민 kakaopay link updated')
    } catch (error) {
      console.error('KakaoPay link update error:', error)
      migrations.push('kakaopay link update failed (non-critical)')
    }

    // 13. admin 테이블 생성 및 username 컬럼 추가
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      migrations.push('admin table created or already exists')
    } catch (error) {
      console.error('Admin table creation error:', error)
      migrations.push('admin table creation failed (non-critical)')
    }

    // username 컬럼이 없으면 추가
    try {
      await pool.query(`
        ALTER TABLE admin 
        ADD COLUMN username VARCHAR(50) NOT NULL UNIQUE FIRST
      `)
      migrations.push('admin: username column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('admin: username column already exists')
      } else {
        console.log('Admin username column migration skipped:', mysqlError.message)
      }
    }

    // 14. 기존 admin 데이터 삭제 후 새로운 admin 추가
    try {
      // 기존 admin 모두 삭제
      await pool.query('DELETE FROM admin')
      migrations.push('existing admin records deleted')
      
      // 새로운 admin 두 명 추가 (암호화된 비밀번호)
      const minPassword = encryptPassword('f8tgw3lshms!')
      const solPassword = encryptPassword('qlrqod1027@')
      
      await pool.query(
        'INSERT INTO admin (username, password) VALUES (?, ?), (?, ?)',
        ['min', minPassword, 'sol', solPassword]
      )
      migrations.push('new admin accounts (min, sol) created with encrypted passwords')
    } catch (error) {
      console.error('Admin setup error:', error)
      migrations.push('admin setup failed (non-critical)')
    }

    // 15. HEIC 파일들 정리 (404 오류 방지)
    try {
      const koreaTime = new Date(Date.now() + (9 * 60 * 60 * 1000))
      const formattedTime = koreaTime.toISOString().slice(0, 19).replace('T', ' ')
      
      const [result] = await pool.query(
        `UPDATE gallery SET deleted_at = ? 
         WHERE (filename LIKE '%.HEIC' OR filename LIKE '%.heic') 
         AND deleted_at IS NULL`,
        [formattedTime]
      )
      
      const updateResult = result as MySQLUpdateResult
      migrations.push(`HEIC files cleaned up: ${updateResult.affectedRows} files marked as deleted`)
    } catch (error) {
      console.error('HEIC cleanup error:', error)
      migrations.push('HEIC cleanup failed (non-critical)')
    }

    // 16. 새로운 이미지 업로드 시스템을 위한 images 테이블 생성
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255) NOT NULL,
          target_id VARCHAR(100) NULL,
          file_size INT NOT NULL,
          image_type ENUM('main', 'gallery', 'profile', 'other') DEFAULT 'other',
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          deleted_at DATETIME NULL DEFAULT NULL,
          INDEX idx_target_id (target_id),
          INDEX idx_image_type (image_type),
          INDEX idx_created_at (created_at),
          INDEX idx_deleted_at (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      migrations.push('images table created for new upload system')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_TABLE_EXISTS_ERROR') {
        migrations.push('images table already exists')
      } else {
        console.error('Images table creation error:', error)
        migrations.push('images table creation failed')
      }
    }

    // 17. 기존 gallery 데이터를 새로운 images 테이블로 마이그레이션 (필요시)
    try {
      // 기존 gallery 테이블에서 images 테이블로 데이터 복사
      const [existingData] = await pool.query(`
        SELECT COUNT(*) as count FROM images
      `)
      const imageCount = (existingData as { count: number }[])[0].count

      if (imageCount === 0) {
        // images 테이블이 비어있으면 gallery 데이터 복사
        await pool.query(`
          INSERT INTO images (filename, original_name, target_id, file_size, image_type, created_at, updated_at, deleted_at)
          SELECT 
            filename,
            SUBSTRING_INDEX(filename, '/', -1) as original_name,
            CASE 
              WHEN image_type = 'main' THEN 'main_cover'
              WHEN image_type = 'gallery' THEN CONCAT('gallery_', id)
              ELSE NULL
            END as target_id,
            0 as file_size,
            image_type,
            created_at,
            IFNULL(updated_at, created_at) as updated_at,
            deleted_at
          FROM gallery 
          WHERE filename IS NOT NULL AND filename != ''
        `)
        migrations.push('gallery data migrated to images table')
      } else {
        migrations.push('images table already has data, skipping migration')
      }
    } catch (error) {
      console.error('Gallery to images migration error:', error)
      migrations.push('gallery to images migration failed (non-critical)')
    }

    // 18. gallery 테이블에 order_index 컬럼 추가 (갤러리 순서 변경 기능용)
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN order_index INT DEFAULT 0
      `)
      migrations.push('gallery: order_index column added for reordering feature')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: order_index column already exists')
      } else {
        console.error('Gallery order_index column error:', error)
        migrations.push('gallery: order_index column addition failed (non-critical)')
      }
    }

    // 19. 기존 갤러리 이미지들의 order_index를 created_at 순서로 재설정
    try {
      // 갤러리 이미지들을 created_at 순서로 조회
      const [galleryRows] = await pool.query(`
        SELECT id FROM gallery 
        WHERE image_type = 'gallery' AND deleted_at IS NULL 
        ORDER BY created_at ASC
      `)
      const galleryImages = galleryRows as { id: number }[]
      
      // 각 이미지에 순서대로 order_index 설정 (1부터 시작)
      for (let i = 0; i < galleryImages.length; i++) {
        await pool.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [i + 1, galleryImages[i].id]
        )
      }
      
      migrations.push(`gallery: order_index updated for ${galleryImages.length} existing images`)
    } catch (error) {
      console.error('Gallery order_index update error:', error)
      migrations.push('gallery: order_index update failed (non-critical)')
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      details: migrations
    })
  } catch (error: unknown) {
    console.error('Migration error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 