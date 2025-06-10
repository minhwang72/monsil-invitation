import { NextResponse } from 'next/server'
import pool from '@/lib/db'

interface MySQLError extends Error {
  code?: string
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
          filename VARCHAR(255) NOT NULL,
          image_type ENUM('main', 'gallery') DEFAULT 'gallery',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL DEFAULT NULL,
          INDEX idx_image_type (image_type),
          INDEX idx_deleted_at (deleted_at)
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

    // 5. 메인 이미지는 1개만 존재하도록 하는 트리거 생성
    try {
      await pool.query(`DROP TRIGGER IF EXISTS enforce_single_main_image`)
      await pool.query(`
        CREATE TRIGGER enforce_single_main_image
        BEFORE INSERT ON gallery
        FOR EACH ROW
        BEGIN
          IF NEW.image_type = 'main' THEN
            UPDATE gallery SET deleted_at = NOW() WHERE image_type = 'main' AND deleted_at IS NULL;
          END IF;
        END
      `)
      migrations.push('main image constraint trigger created')
    } catch (error) {
      console.error('Trigger creation error:', error)
      // 트리거 생성 실패는 치명적이지 않으므로 계속 진행
      migrations.push('main image constraint trigger creation failed (non-critical)')
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

    // 7. contacts 테이블에 초기 데이터 삽입
    try {
      // 기존 데이터가 있는지 확인
      const [existingRows] = await pool.query('SELECT COUNT(*) as count FROM contacts')
      const count = (existingRows as any[])[0].count
      
      if (count === 0) {
        // 초기 연락처 데이터 삽입
        const contactsData = [
          ['groom', 'person', '황민', '01036986181'],
          ['groom', 'father', '황현기', '01030666181'], 
          ['groom', 'mother', '박인숙', '01042526181'],
          ['bride', 'person', '이은솔', '01089390389'],
          ['bride', 'father', '이완규', '01045990389'],
          ['bride', 'mother', '홍순자', '']
        ]
        
        for (const contact of contactsData) {
          await pool.query(
            'INSERT INTO contacts (side, relationship, name, phone) VALUES (?, ?, ?, ?)',
            contact
          )
        }
        migrations.push('initial contact data inserted')
      } else {
        migrations.push('contact data already exists, skipping initial data insertion')
      }
    } catch (error) {
      console.error('Contact data insertion error:', error)
      migrations.push('contact data insertion failed (non-critical)')
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