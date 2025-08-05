import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { hashPassword } from '@/lib/encryption'
import type { ApiResponse } from '@/types'

interface MySQLError {
  code?: string
  message?: string
}

export async function POST() {
  try {
    console.log('🔍 [DEBUG] Starting migration...')

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

    // 4-5. gallery 테이블에 order_index 컬럼 추가
    try {
      await pool.query(`
        ALTER TABLE gallery 
        ADD COLUMN order_index INT NULL DEFAULT NULL
      `)
      migrations.push('gallery: order_index column added')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      if (mysqlError.code === 'ER_DUP_FIELDNAME') {
        migrations.push('gallery: order_index column already exists')
      } else {
        console.log('Gallery order_index column migration skipped:', mysqlError.message)
      }
    }

    // 4-6. 기존 gallery 이미지들에 order_index 설정
    try {
      const [rows] = await pool.query(`
        SELECT id FROM gallery 
        WHERE image_type = 'gallery' AND order_index IS NULL AND deleted_at IS NULL 
        ORDER BY created_at ASC
      `)
      
      const galleryItems = rows as { id: number }[]
      for (let i = 0; i < galleryItems.length; i++) {
        await pool.query(
          'UPDATE gallery SET order_index = ? WHERE id = ?',
          [i + 1, galleryItems[i].id]
        )
      }
      
      if (galleryItems.length > 0) {
        migrations.push(`gallery: order_index set for ${galleryItems.length} existing items`)
      } else {
        migrations.push('gallery: no existing items need order_index update')
      }
    } catch (error) {
      console.error('Gallery order_index update error:', error)
      migrations.push('gallery: order_index update failed (non-critical)')
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
          relationship ENUM('person', 'father', 'mother', 'brother', 'sister', 'other') NOT NULL,
          name VARCHAR(50) NOT NULL,
          phone VARCHAR(20) DEFAULT NULL,
          bank_name VARCHAR(50) DEFAULT NULL,
          account_number VARCHAR(50) DEFAULT NULL,
          kakaopay_link VARCHAR(500) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)
      migrations.push('contacts table created or already exists')
    } catch (error) {
      console.error('Contacts table creation error:', error)
      throw error
    }

    // 6-1. 기존 contacts 테이블의 relationship ENUM 확장
    try {
      await pool.query(`
        ALTER TABLE contacts 
        MODIFY COLUMN relationship ENUM('person', 'father', 'mother', 'brother', 'sister', 'other') NOT NULL
      `)
      migrations.push('contacts: relationship enum extended with new options')
    } catch (error: unknown) {
      const mysqlError = error as MySQLError
      // 이미 확장된 경우 또는 기타 에러는 무시
      console.log('Contacts relationship enum extension skipped:', mysqlError.message)
      migrations.push('contacts: relationship enum extension skipped (may already be extended)')
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

    // 8. contacts 테이블 초기화 제거 - API로만 관리하도록 변경
    migrations.push('contacts table initialization removed - managed via API only')

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

    // 12. 카카오페이 링크 업데이트 제거 - API로만 관리
    migrations.push('kakaopay link updates removed - managed via API only')

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
      const minPassword = hashPassword('f8tgw3lshms!')
      const solPassword = hashPassword('qlrqod1027@')
      
      await pool.query(
        'INSERT INTO admin (username, password) VALUES (?, ?), (?, ?)',
        ['min', minPassword, 'sol', solPassword]
      )
      migrations.push('new admin accounts (min, sol) created with hashed passwords')
    } catch (error) {
      console.error('Admin setup error:', error)
      migrations.push('admin setup failed (non-critical)')
    }

    // 15. HEIC 파일 정리 제거 - 개발 단계용 코드
    migrations.push('HEIC cleanup removed - development only code')

    // 18. gallery order_index 관련 중복 코드 제거 - 이미 완료됨
    migrations.push('gallery order_index migrations removed - already completed')

    // 5. 방명록 비밀번호 해시화 제거 - 이미 완료됨
    migrations.push('guestbook password hashing removed - already completed')

    console.log('✅ [DEBUG] Migration completed')

    return NextResponse.json<ApiResponse<string[]>>({
      success: true,
      data: migrations,
    })
  } catch (error) {
    console.error('❌ [DEBUG] Migration failed:', error)
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: 'Migration failed',
      },
      { status: 500 }
    )
  }
}