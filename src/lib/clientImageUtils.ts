// 타입 정의
interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// HEIC 변환을 위한 동적 import 함수
async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    const heic2any = await import('heic2any');
    const convertedBlob = await heic2any.default({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9
    }) as Blob;
    
    return new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
      type: 'image/jpeg'
    });
  } catch (error) {
    console.error('❌ [DEBUG] HEIC conversion error:', error);
    throw new Error('HEIC 파일 변환에 실패했습니다.');
  }
}

// 클라이언트 사이드 이미지 변환 함수
export async function convertImageToBase64(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    console.log('🔍 [DEBUG] Converting image:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    try {
      let processFile = file;
      
      // HEIC 파일인 경우 JPEG로 변환
      if (file.name.toLowerCase().includes('.heic') || file.type === 'image/heic') {
        console.log('🔍 [DEBUG] Converting HEIC to JPEG...');
        
        try {
          processFile = await convertHeicToJpeg(file);
          console.log('✅ [DEBUG] HEIC converted to JPEG successfully');
        } catch (heicError) {
          console.error('❌ [DEBUG] HEIC conversion failed:', heicError);
          reject(new Error('HEIC 파일 변환에 실패했습니다. 다른 형식으로 변환해서 업로드해주세요.'));
          return;
        }
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            console.log('🔍 [DEBUG] Original image size:', img.width, 'x', img.height);
            
            // 캔버스 생성
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Canvas context를 생성할 수 없습니다.'));
              return;
            }
            
            // 이미지 크기 조정 (최대 너비 제한)
            let { width, height } = img;
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            
            console.log('🔍 [DEBUG] Resized image size:', width, 'x', height);
            
            canvas.width = width;
            canvas.height = height;
            
            // 이미지를 캔버스에 그리기
            ctx.drawImage(img, 0, 0, width, height);
            
            // JPEG로 변환하여 base64 생성
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log('✅ [DEBUG] Image converted to base64, size:', dataUrl.length);
            
            resolve(dataUrl);
          } catch (error) {
            console.error('❌ [DEBUG] Canvas conversion error:', error);
            reject(new Error('이미지 변환 중 오류가 발생했습니다.'));
          }
        };
        
        img.onerror = (error) => {
          console.error('❌ [DEBUG] Image load error:', error);
          reject(new Error('이미지를 로드할 수 없습니다. 지원되지 않는 형식이거나 손상된 파일일 수 있습니다.'));
        };
        
        if (typeof e.target?.result === 'string') {
          img.src = e.target.result;
        } else {
          reject(new Error('파일을 읽을 수 없습니다.'));
        }
      };
      
      reader.onerror = () => {
        console.error('❌ [DEBUG] FileReader error');
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      };
      
      reader.readAsDataURL(processFile);
    } catch (error) {
      console.error('❌ [DEBUG] File processing error:', error);
      reject(new Error('파일 처리 중 오류가 발생했습니다.'));
    }
  });
}

// 클라이언트 사이드 파일 검증 및 전처리 함수
export async function validateAndPrepareFile(file: File): Promise<ValidationResult> {
  console.log('🔍 [DEBUG] Validating file:', {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  })

  // 기본 유효성 검사
  if (!file) {
    return { isValid: false, error: '파일이 선택되지 않았습니다.' }
  }

  if (!file.name) {
    return { isValid: false, error: '파일명이 없습니다.' }
  }

  // 파일 크기 검사 (50MB로 증가)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `파일 크기가 너무 큽니다. 최대 50MB까지 업로드할 수 있습니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)` 
    }
  }

  if (file.size === 0) {
    return { isValid: false, error: '빈 파일은 업로드할 수 없습니다.' }
  }
  
  // 지원되는 이미지 형식 체크 (서버에서 HEIC 처리하므로 모든 이미지 허용)
  const supportedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'
  ];
  
  const isValidType = supportedTypes.includes(file.type) || 
                     file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/);
  
  if (!isValidType) {
    return {
      isValid: false,
      error: '지원되지 않는 파일 형식입니다. JPG, PNG, WebP, HEIC 형식의 이미지를 선택해주세요.'
    };
  }
  
  console.log('✅ [DEBUG] File validation passed');
  return { isValid: true };
} 