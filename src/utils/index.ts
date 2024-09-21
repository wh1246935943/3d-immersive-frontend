type ChooseFilesReturnType = 'file' | 'url' | 'base64';

interface ChooseFilesOptions<T extends ChooseFilesReturnType> {
  accept: string;
  multiple: boolean;
  returnType: T
};

type UrlFile = {
  url: string;
  file: File
};

type Base64File = {
  base64: string;
  file: File
};

type ChooseFilesReturn<T extends ChooseFilesReturnType> = 
  T extends 'file' ? File[] :
  T extends 'url' ? UrlFile[] :
  T extends 'base64' ? Base64File[] : never
/**
 * 选择文件
 * @param options 选择文件的配置
 * @returns
 * - 当 options.returnType 为 'file' 时，返回 File 类型的文件数组
 * - 当 options.returnType 为 'url' 时，返回包含 url 和 file 属性的对象数组，其中 url 是文件的 URL，file 是原始的 File 对象
 * - 当 options.returnType 为 'base64' 时，返回包含 base64 和 file 属性的对象数组，其中 base64 是文件的 base64 编码，file 是原始的 File 对象
 * @example
 * // 选择单个图片文件
 * const imageFile = await chooseFilesUtils({
 *   accept: 'image/*',
 *   multiple: false,
 *   returnType: 'file'
 * });
 */
export function chooseFilesUtils<T extends ChooseFilesReturnType = 'file'>(
  options: Partial<ChooseFilesOptions<T>> = {}
): Promise<ChooseFilesReturn<T>> {
  const { accept = 'all/*', multiple = false, returnType = 'file' } = options;

  return new Promise((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = accept;
    fileInput.multiple = multiple;

    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement)?.files ?? [];

      if (files.length === 0) {
        resolve([] as any); // 空数组作为默认返回
        return;
      }

      if (returnType === 'file') {
        resolve(Array.from(files) as ChooseFilesReturn<T>);
        return;
      }

      if (returnType === 'url') {
        const urlFiles: UrlFile[] = [];
        Array.from(files).forEach((file) => {
          const url = URL.createObjectURL(file);
          urlFiles.push({ url, file });
        });
        resolve(urlFiles as ChooseFilesReturn<T>);
        return;
      }

      if (returnType === 'base64') {
        const base64Files: Base64File[] = [];
        Array.from(files).forEach((file) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = () => {
            const base64 = reader.result as string;
            base64Files.push({ base64, file });
            resolve(base64Files as ChooseFilesReturn<T>);
          };
        });
        return;
      }
    };

    fileInput.click();
  });
}