/**
 * Convert a file to base64 data URL
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('Failed to convert file to base64'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Convert image URL to base64 data URL
 */
export const convertImageUrlToBase64 = (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      try {
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataURL);
      } catch {
        reject(new Error('Failed to convert image to base64'));
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Validate file type and size
 */
export const validateFile = (
  file: File,
  allowedTypes: string[] = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  maxSizeMB: number = 5,
): { isValid: boolean; error?: string } => {
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not supported. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      isValid: false,
      error: `File should be less than ${maxSizeMB} MB`,
    };
  }

  return { isValid: true };
};

/**
 * Check if string is a valid base64 data URL
 */
export const isValidBase64DataUrl = (str: string): boolean => {
  return str.includes(';base64,');
};
