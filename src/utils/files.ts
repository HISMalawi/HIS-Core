type filetype = "application/label" | "text/plain" | 'application/pdf'

export function download(rawContents: BlobPart | BlobPart[], filename: string, type = 'application/label' as filetype) {
  const file = new File([rawContents].flat(), filename, { type, })
  const link = document.createElement('a');
  const url = URL.createObjectURL(file);
  link.href = url;
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}