(function (root) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const UFN = node ? require("./ufn.js") : root.UFN;
  const library = node ? require("./library.js") : root.UFNLibrary;
  const matrix = node ? require("./matrix.js") : root.UFNMatrix;
  const totalName = "□⌊◠⌋", firstName = "□⌊⟨◠⟩⌋", secondName = "□⌊⟨◠○⟩⌋";
  const declarations = Object.freeze([
    `≔(↔⟪${totalName} : ${firstName}⟫ : (${firstName} [${totalName} | ${firstName}]))`,
    `≔(↕⟪${totalName} : ${firstName} : ${secondName}⟫ : (${firstName} ${secondName} [${totalName} | ${firstName} ${secondName}]))`,
  ]);
  const choices = Object.freeze(Array.from({length:17}, (_, index) => UFN.compute(`{⟨◡⟩ ${UFN.encodeInteger(index - 4)}}`).canonical));
  function number(source, description) {
    const result = UFN.compute(source);
    if (result.kind !== "number") throw new matrix.MatrixInputError(description + " must be a numerical expression, not a list.");
    if (result.partial) throw new matrix.MatrixInputError(description + " is a finite preview. Supply a number or an explicitly completed limit.");
    return result;
  }
  function describe(freeSources, totalSource = "⟨◠○⟩") {
    if (!Array.isArray(freeSources) || ![1,2].includes(freeSources.length))
      throw new matrix.MatrixInputError("Choose one or two freely supplied amounts.");
    const free = freeSources.map((source,index) => number(source,index ? "The second amount" : "The first amount"));
    const total = number(totalSource,"The total");
    const definition = declarations[freeSources.length-1];
    const form = (freeSources.length===1 ? "↔" : "↕") + "⟪" + [totalSource,...freeSources].join(" : ") + "⟫";
    const source = definition + "\n\n" + form;
    const inputs = UFN.compute(source);
    const joinedSource = definition + `\n\n[□⌊⟨⟨◠⟩⟩⌋ □⌊⟨◠○○⟩⌋ : ${form} : □⌊⟨⟨◠⟩⟩⌋]`;
    const joined = UFN.compute(joinedSource);
    const gapSource = definition + `\n\n[[□⌊⟨⟨◠⟩⟩⌋ □⌊⟨◠○○⟩⌋ : ${form} : □⌊⟨⟨◠⟩⟩⌋] | ${totalSource}]`;
    const gap = UFN.compute(gapSource);
    const matches = gap.canonical === "○" ? true : gap.canonical !== null ? false : null;
    const row = "(" + Array(freeSources.length+1).fill("◠").join(" ") + ")";
    const checkSource = library.declarations(["matrix"]) + "\n\n" + definition + `\n\n▦⟪(${row}) : ${form}⟫`;
    return { free,total,inputs,joined,gap,matches,source,joinedSource,gapSource,checkSource };
  }
  const api = Object.freeze({ declarations,choices,describe });
  if (node) { module.exports=api; return; }
  root.UFNSolutionFamilies=api;
  const panel=document.getElementById("solution-family"); if (!panel) return;
  const get=name=>document.getElementById("family-"+name);
  const display=result=>result.display||result.ufn||"Unfinished exact recipe";
  let current=null,timer;
  const svgElement=(tag,attributes)=>{const el=document.createElementNS("http://www.w3.org/2000/svg",tag);for(const [key,value] of Object.entries(attributes))el.setAttribute(key,value);return el;};
  function picture(result) {
    const holder=get("picture"); holder.replaceChildren();
    if (!result.inputs.established || result.matches!==true) return false;
    const amounts=[...result.inputs.items];
    // Projection only draws the already reduced original-path amounts. It
    // never supplies a solution, a compensation amount, or an equality check.
    let projected;
    try { projected=amounts.map(item=>item.value); } catch { return false; }
    if(projected.some(value=>value.slice(1).some(part=>part!==0))) return false;
    let total;
    try {total=result.joined.value;} catch {return false;}
    if(total.slice(1).some(part=>part!==0))return false;
    const values=[...projected.map(value=>value[0]),total[0]];
    if(values.some(value=>!Number.isFinite(value)))return false;
    const extent=Math.max(6,...values.map(Math.abs)),scale=130/extent;
    values.forEach((amount,index)=>{
      const row=document.createElement("div");row.className="family-picture-row";
      const label=document.createElement("span");label.textContent=index===values.length-1 ? "Joined" : ["First input","Second input","Third input"][index];
      const svg=svgElement("svg",{viewBox:"0 0 300 42",role:"img","aria-label":amount===0?"No displacement":amount<0?"An amount backward from ○":"An amount forward from ○"});
      svg.append(svgElement("line",{x1:12,y1:18,x2:288,y2:18,class:"family-path"}),svgElement("line",{x1:150,y1:7,x2:150,y2:30,class:"family-origin"}));
      const end=150+amount*scale;
      svg.append(svgElement("line",{x1:150,y1:18,x2:end,y2:18,class:"family-amount"}),svgElement("circle",{cx:end,cy:18,r:4,class:"family-end"}));
      const zero=svgElement("text",{x:150,y:40,"text-anchor":"middle",class:"family-zero"});zero.textContent="○";svg.append(zero);
      const code=document.createElement("code");code.textContent=display(index<amounts.length?amounts[index]:result.joined);
      row.append(label,svg,code);holder.append(row);
    });
    return true;
  }
  function syncSliders(result) {
    result.free.forEach((amount,index)=>{
      const slider=get(index?"second-slider":"first-slider"),reset=get(index?"second-reset":"first-reset");
      const position=choices.indexOf(amount.canonical);
      slider.disabled=position<0;reset.hidden=position>=0;
      if(position>=0)slider.value=position;
      slider.setAttribute("aria-valuetext",position<0?"This typed amount is outside the half-step choices":display(amount));
    });
  }
  function update() {
    clearTimeout(timer);
    const count=Number(get("count").value);
    get("second-choice").hidden=count===1;
    try {
      current=describe(count===1?[get("first").value]:[get("first").value,get("second").value]);
      get("error").hidden=true;get("work").hidden=false;get("try").disabled=false;
      get("inputs").textContent=display(current.inputs);
      get("remaining").textContent=display(current.inputs.items?.at(-1)||UFN.compute("[⟨◠○⟩ | "+[get("first").value,...(count===2?[get("second").value]:[])].join(" ")+"]"));
      get("joined").textContent=current.matches===true ? display(current.joined) : "Not reduced yet";
      get("rule").textContent=count===1 ? "Keep your first amount. Undo it from three steps to find the second." : "Keep your first two amounts. Undo both from three steps to find the third.";
      get("status").textContent=current.matches===true ? "The joined amount is still three steps. This input fits." : "The construction remains an exact recipe. The calculator cannot yet confirm its joined amount.";
      get("picture").hidden=!picture(current);
      get("picture-note").textContent=get("picture").hidden ? "The recipe also accepts directed amounts. The line picture shows only amounts along the original path that the calculator has reduced." : "Each line begins at ○. Move a chosen amount and watch the remaining amount compensate.";
      get("try").dataset.example=current.checkSource;
      syncSliders(current);
    } catch(error) {
      current=null;get("error").textContent=error.message;get("error").hidden=false;get("work").hidden=true;get("try").disabled=true;delete get("try").dataset.example;
    }
  }
  get("count").addEventListener("change",update);
  ["first","second"].forEach(name=>{
    const edited=()=>{clearTimeout(timer);current=null;get("work").hidden=true;get("try").disabled=true;delete get("try").dataset.example;timer=setTimeout(update,180);};
    get(name).addEventListener("input",edited);get(name).addEventListener("ufn-input",edited);
    get(name+"-slider").addEventListener("input",()=>{get(name).value=choices[Number(get(name+"-slider").value)];update();});
    get(name+"-reset").addEventListener("click",()=>{get(name).value="◠";update();});
  });
  panel.hidden=false;update();
})(typeof globalThis!=="undefined"?globalThis:this);
