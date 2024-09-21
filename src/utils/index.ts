type ChooseFilesAccept = 'image/*' | 'video/*' | 'audio/*' | 'application/*' | 'text/*' | 'all/*';

type ChooseFilesOptions = {
  accept: ChooseFilesAccept;
  multiple: boolean;
  returnType: 'file' | 'url' | 'base64';
};

type UrlFile = {
  url: string;
  file: File
};

type Base64File = {
  base64: string;
  file: File
};

const defaultChooseFilesOptions: ChooseFilesOptions = {
  accept: 'all/*',
  multiple: false,
  returnType: 'file'
};

/**
 * 选择文件
 * @param options 选择文件的配置
 * @returns
 * - 当 options.returnType 为 'file' 时，返回 File 类型的文件数组
 * - 当 options.returnType 为 'url' 时，返回包含 url 和 file 属性的对象数组，其中 url 是文件的 URL，file 是原始的 File 对象
 * - 当 options.returnType 为 'base64' 时，返回包含 base64 和 file 属性的对象数组，其中 base64 是文件的 base64 编码，file 是原始的 File 对象
 * - 当 options.returnType 为其他值时，返回空数组
 * @example
 * // 选择单个图片文件
 * const imageFile = await chooseFilesUtils({
 *   accept: 'image/*',
 *   multiple: false,
 *   returnType: 'file'
 * });
 */
export const chooseFilesUtils = <T>(options = defaultChooseFilesOptions): Promise<T> => {
  return new Promise<T>((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = options.accept;
    fileInput.multiple = options.multiple;

    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement)?.files;
      if (files?.length === 0) {
        resolve([]);
        return;
      };

      if (options.returnType === 'file') {
        resolve(files);
        return;
      }

      if (options.returnType === 'url') {
        const urlFiles: UrlFile[] = [];
        Array.from(files).forEach((file) => {
          const url = URL.createObjectURL(file);
          urlFiles.push({ url, file });
        });
        resolve(urlFiles)
        return;
      }

      if (options.returnType === 'base64') {
        const base64Files: Base64File[] = [];
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
      
          reader.onload = () => {
            const base64 = reader.result as string;
            base64Files.push({ base64, file });
            resolve(base64Files);
          }
        });
        return;
      }
    };
  
    fileInput.click();
  })
}