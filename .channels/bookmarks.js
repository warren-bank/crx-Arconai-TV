// https://www.arconaitv.us/
// https://www.arconaitv.us/index.php#cable
// https://www.arconaitv.us/index.php#shows
// https://www.arconaitv.us/index.php#movies

{
  const process_category = (id) => {
    const links = [...document.querySelectorAll(`#${id} a[href]`)]

    const data = links.map(el => [el.href, (el.title || el.innerText).trim()]).sort((a,b) => {
      const at = a[1]
      const bt = b[1]
      return (at < bt)
        ? -1
        : (at == bt)
            ? 0
            : 1
    })

    let $md     = ''
    let $html   = ''
    let $import = ''
    let i

    for (i=0; i<data.length; i++) {
      let href = data[i][0]
      let name = data[i][1]

      $md     += `  * [${name}](${href})\n`
      $html   += `                <li><a href="${href}">${name}</a>\n`
      $import += `                <DT><A HREF="${href}">${name}</A>\n`
    }

    const hr = "\n----------------------------------------\n"

    console.log(`${hr}${id}:${hr}${$md}${hr}${$html}${hr}${$import}${hr}`)
  }

  process_category('cable')
  process_category('shows')
  process_category('movies')
}
