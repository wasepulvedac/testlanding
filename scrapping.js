import fetch from "node-fetch";
import { writeFile } from "fs/promises";
import { JSDOM } from "jsdom";
import { write } from "fs";
const getAbsoluteUrl = (function () {
  var a;

  return function (document, url) {
    if (!a) a = document.createElement("a");
    a.href = url;

    return a.href;
  };
})();
async function scrap(resolve) {
  /*
    '/wiki/Archivo:Escudo_de_Mejillones.svg'
    https://commons.wikimedia.org/wiki/File:Escudo_de_Arica.svg
    https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Escudo_de_Arica.svg/653px-Escudo_de_Arica.svg.png?20120302164803
    https://upload.wikimedia.org/wikipedia/commons/1/1a/Escudo_de_Arica.svg
    */
  const page = await (
    await fetch("https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile")
  ).text();
  const dom = new JSDOM(page, {
    url: "https://es.wikipedia.org/wiki/Anexo:Comunas_de_Chile",
  });
  const comunas = [...dom.window.document.querySelectorAll("tbody > tr")].map(
    (tr) => {
      let a = tr.children.item(2).querySelector("a");
      return {
        cut: tr.children.item(0).textContent.trim(),
        idRegion: parseInt(tr.children.item(0).textContent.substring(0, 2)),
        idProvincia: parseInt(tr.children.item(0).textContent.substring(2, 4)),
        idComuna: parseInt(tr.children.item(0).textContent.substring(4, 6)),
        nombre: tr.children.item(1).textContent.trim(),
        provincia: tr.children.item(3).textContent.trim(),
        region: tr.children.item(4).textContent.trim(),
        escudo: a
          ? getAbsoluteUrl(dom.window.document, a.getAttribute("href"))
          : null,
      };
    }
  );
  await writeFile("info.json", JSON.stringify(comunas, null, 2));
  for (let index = 0; index < comunas.length; index++) {
    const comuna = comunas[index];
    
    if (comuna.escudo != null) {
        console.log(comuna.nombre,comuna.escudo)
      const spage = await (await fetch(comuna.escudo)).text();
      const sdom = new JSDOM(spage, { url: comuna.escudo });
      console.log(sdom.window.document.querySelector(".fullImageLink a"))
      comunas[index].linksvg=sdom.window.document.querySelector(".fullImageLink a").href;
      await writeFile(`svg\\${comuna.cut}.svg`,await (await fetch(comuna.linksvg)).text());

    }
  }
  await writeFile("info2.json", JSON.stringify(comunas, null, 2));
  resolve();
}
new Promise((resolve) => scrap(resolve));

/*
const getAbsoluteUrl = (function() {
	var a;

	return function(url) {
		if(!a) a = document.createElement('a');
		a.href = url;

		return a.href;
	};
})();
[...document.querySelectorAll("tbody > tr")].map(tr=>{
        let a=tr.children.item(2).querySelector("a");
        return {
            cut:tr.children.item(0).textContent.trim(),
            idRegion:parseInt(tr.children.item(0).textContent.substring(0,2)),
            idProvincia:parseInt(tr.children.item(0).textContent.substring(2,4)),
            idComuna:parseInt(tr.children.item(0).textContent.substring(4,6)),
            nombre:tr.children.item(1).textContent.trim(),
            provincia:tr.children.item(3).textContent.trim(),
            region:tr.children.item(4).textContent.trim(),
            escudo:a?getAbsoluteUrl(a.getAttribute('href')):null
        };
    });

<img alt="Escudo de Quilpué" src="//upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Escudo_de_Quilpu%C3%A9.svg/28px-Escudo_de_Quilpu%C3%A9.svg.png" decoding="async" width="28" height="30" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Escudo_de_Quilpu%C3%A9.svg/42px-Escudo_de_Quilpu%C3%A9.svg.png 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Escudo_de_Quilpu%C3%A9.svg/56px-Escudo_de_Quilpu%C3%A9.svg.png 2x" data-file-width="849" data-file-height="907"></img>

*/
