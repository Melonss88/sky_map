export function htmlDecode(input: string): string {
    if (!input) return '';
    const e = document.createElement('div');
    e.innerHTML = input;
    return e.childNodes[0]?.nodeValue || '';
  }
  