(function (root) {
  "use strict";
  const node = typeof module !== "undefined" && module.exports;
  const UFN = node ? require("./ufn.js") : root.UFN;
  const library = node ? require("./library.js") : root.UFNLibrary;
  const matrix = node ? require("./matrix.js") : root.UFNMatrix;
  const identity = "((◠ ○) (○ ◠))";
  const operations = Object.freeze({
    removeFirst: Object.freeze({ title: "Undo the first clue from the second", table: "((◠ ○) (◡ ◠))", inverse: "((◠ ○) (◠ ◠))", row: 1,
      recipe: (a,b) => `[${b} | ${a}]`, reading: "Keep the first row. In every part of the second row, undo the matching part of the first. Make the same change to the requested answer." }),
    removeSecond: Object.freeze({ title: "Undo the second clue from the first", table: "((◠ ◡) (○ ◠))", inverse: "((◠ ◠) (○ ◠))", row: 0,
      recipe: (a,b) => `[${a} | ${b}]`, reading: "Keep the second row. Undo it from each part of the first row and from the first requested answer." }),
    removeTwiceFirst: Object.freeze({ title: "Undo twice the first clue from the second", table: "((◠ ○) ([|⟨◠⟩] ◠))", inverse: "((◠ ○) (⟨◠⟩ ◠))", row: 1,
      recipe: (a,b) => `[${b} | {⟨◠⟩ ${a}}]`, reading: "Keep the first row. Undo two copies of it from the second row, including two copies of its requested answer." }),
    halveFirst: Object.freeze({ title: "Halve the first clue", table: "((⟨◡⟩ ○) (○ ◠))", inverse: "((⟨◠⟩ ○) (○ ◠))", row: 0,
      recipe: a => `{⟨◡⟩ ${a}}`, reading: "Halve both instructions in the first row and halve its requested answer. Keep the second row." }),
    swap: Object.freeze({ title: "Swap the two clues", table: "((○ ◠) (◠ ○))", inverse: "((○ ◠) (◠ ○))",
      reading: "Exchange the complete rows. Each requested answer travels with its row." }),
  });
  const examples = Object.freeze([
    { title: "A shared first input", table: "((◠ ◠) (◠ ⟨◠⟩))", target: "(⟨◠○⟩ ⟨⟨◠⟩⟩)", changes: ["removeFirst", "removeSecond"], finalShape: "identity" },
    { title: "The same clue twice", table: "((◠ ◠) (⟨◠⟩ ⟨◠⟩))", target: "(⟨◠○⟩ ⟨◠◠⟩)", changes: ["removeTwiceFirst"], finalShape: "joined" },
    { title: "Clues that disagree", table: "((◠ ◠) (⟨◠⟩ ⟨◠⟩))", target: "(⟨◠○⟩ ⟨◠○○○⟩)", changes: ["removeTwiceFirst"], finalShape: "joined" },
    { title: "Make a doubled clue smaller", table: "((⟨◠⟩ ○) (○ ◠))", target: "(⟨◠○⟩ ◠)", changes: ["halveFirst"], finalShape: "identity" },
    { title: "Put the useful clue below", table: "((○ ◠) (◠ ◠))", target: "(◠ ⟨◠○⟩)", changes: ["swap", "removeSecond"], finalShape: "identity" },
  ].map(example => Object.freeze({ ...example, changes: Object.freeze(example.changes) })));
  const declared = form => library.declarations(["matrix-compose"]) + "\n\n" + form;
  function change(tableSource, targetSource, name) {
    const operation = operations[name];
    if (!operation) throw new matrix.MatrixInputError("Choose one of the reversible row changes.");
    const table = finiteSequence(tableSource, "The table");
    if (table.items.length !== 2 || table.items.some(row => row.kind !== "sequence" || !row.items || row.items.length !== 2 || row.items.some(item => item.kind !== "number")))
      throw new matrix.MatrixInputError("This walkthrough needs two clues, each with two numerical input instructions.");
    const target = finiteSequence(targetSource, "The requested output");
    if (target.items.length !== 2 || target.items.some(item => item.kind !== "number"))
      throw new matrix.MatrixInputError("Supply two numerical requested answers in parentheses.");
    return transform(tableSource, targetSource, operation, table, target);
  }
  function finiteSequence(source, description) {
    const result=UFN.compute(declared(source));
    if (result.kind !== "sequence" || !result.items || result.partial)
      throw new matrix.MatrixInputError(description+" needs a finite sequence. Complete limits must be explicit; a preview is not a requested value.");
    return result;
  }
  function transform(tableSource, targetSource, operation, beforeTable, target) {
    const tableForm = `▧⟪${operation.table} : ${tableSource}⟫`;
    const targetForm = `▦⟪${operation.table} : ${targetSource}⟫`;
    const table = UFN.compute(declared(tableForm)), nextTarget = UFN.compute(declared(targetForm));
    const calculations = [];
    if (operation.recipe && beforeTable.established && target.established) {
      for (let column=0;column<3;column++) {
        const a=column===2 ? target.items[0] : beforeTable.items[0].items[column];
        const b=column===2 ? target.items[1] : beforeTable.items[1].items[column];
        const source=operation.recipe(a.ufn,b.ufn);
        calculations.push({label:["First input instruction", "Second input instruction", "Requested answer"][column], source, result: UFN.compute(source)});
      }
    }
    return { operation, table, target: nextTarget, tableForm, targetForm, calculations,
      source: declared(`(${tableForm} ${targetForm})`) };
  }
  function walkthrough(index, targetSource = examples[index]?.target) {
    const example=examples[index];
    if (!example) throw new matrix.MatrixInputError("Choose a clue example.");
    const target = matrix.apply(identity,targetSource).input;
    const table = UFN.compute(example.table);
    const stages=[{table,target,source:declared(`(${example.table} ${targetSource})`)}];
    let tableForm=example.table, targetForm=targetSource;
    for (const name of example.changes) {
      const previous=stages.at(-1);
      const stage=transform(tableForm,targetForm,operations[name],previous.table,previous.target); stages.push(stage);
      tableForm=stage.tableForm; targetForm=stage.targetForm;
    }
    const final=stages.at(-1); let outcome="pending", solutions=[];
    if (final.table.established && final.target.established) {
      if (example.finalShape==="identity") {outcome="one"; solutions=[final.target.ufn];}
      else if (final.target.items[1].canonical==="○") {
        outcome="many";
        const amount=final.target.items[0].ufn;
        solutions=[`(○ ${amount})`, `(◠ [${amount} | ◠])`];
      } else if (final.target.items[1].canonical!==null) outcome="none";
    }
    const checks=solutions.map(input=>({input,source:declared(`▦⟪${example.table} : ${input}⟫`),output:UFN.compute(declared(`▦⟪${example.table} : ${input}⟫`))}));
    return {example,stages,outcome,solutions,checks};
  }
  const api=Object.freeze({operations,examples,change,walkthrough});
  if(node){module.exports=api;return;} root.UFNRowClues=api;
  const panel=document.getElementById("row-clues-demo");if(!panel)return;
  const get=name=>document.getElementById("clues-"+name);
  const element=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
  const code=text=>element("code",text);
  const display=result=>result.display||result.ufn||"Unfinished exact recipe";
  let current=null,visit=0,timer;
  function draw(){
    const stage=current.stages[visit], next=current.stages[visit+1];
    get("stage-title").textContent=["Original clues","After the first row change","After the second row change"][visit];
    const rows=[];
    if(stage.table.items && stage.target.items)stage.table.items.forEach((row,index)=>{
      const tr=element("tr");tr.append(element("th",index?"Second clue":"First clue"));tr.firstChild.scope="row";
      row.items.forEach(item=>{const td=element("td");td.append(code(display(item)));tr.append(td);});
      const td=element("td");td.append(code(display(stage.target.items[index])));tr.append(td);
      if(stage.operation?.row===index)tr.classList.add("matrix-active");rows.push(tr);
    });
    get("rows").replaceChildren(...rows);get("grid").hidden=!rows.length;
    get("unresolved").hidden=!!rows.length;
    get("action").textContent=next ? "Next row change: "+next.operation.title : "Read the simplified clues";
    get("reading").textContent=next?.operation.reading||"The remaining rows tell us which inputs can fit the original request.";
    get("next").disabled=!next;get("back").disabled=visit===0;get("restart").disabled=visit===0;
    get("next").textContent=next?"Make this row change":"All row changes shown";
    get("calculations").hidden=!stage.calculations?.length;
    const cells=(stage.calculations||[]).map(part=>{const tr=element("tr"),label=element("th",part.label);label.scope="row";const td=element("td");td.append(code(part.source+" = "+display(part.result)));tr.append(label,td);return tr;});
    get("calculation-rows").replaceChildren(...cells);
    get("result").hidden=!!next;
    get("outcome").textContent={one:"One input fits",many:"Several inputs fit",none:"No input fits",pending:"The calculation remains unfinished"}[current.outcome];
    get("explanation").textContent={
      one:"Each row now keeps exactly one input entry. The requested answers give those entries. The row changes can all be undone, so this input also fits the original clues.",
      many:"The second row contributes no steps and requests no steps. It adds no restriction. The first row fixes the joined amount; different pairs can supply it.",
      none:"The second row contributes no steps but requests an amount other than ○. No input can make that row true. The reversible changes show that the original clues cannot both be true either.",
      pending:"The calculator has not established every requested amount. Keep the exact recipe; an unfinished reduction does not prove how many inputs fit."
    }[current.outcome];
    const answers=get("answers");answers.replaceChildren();
    current.checks.forEach(check=>{const p=element("p","Input that fits: ");p.append(code(check.input));const output=element("p","Checked against the original table: ");output.append(code(display(check.output)));answers.append(p,output);});
    get("status").textContent=next?"Predict the changed row and its requested answer before making the change.":"All row changes shown. Read the remaining clues.";
    get("try").disabled=false;get("try").dataset.example=stage.source;
  }
  function update(){clearTimeout(timer);visit=0;try{current=walkthrough(Number(get("choice").value),get("target").value);get("error").hidden=true;get("work").hidden=false;draw();}catch(error){current=null;get("error").textContent=error.message;get("error").hidden=false;get("work").hidden=true;get("try").disabled=true;delete get("try").dataset.example;}}
  examples.forEach((example,index)=>{const option=element("option",example.title);option.value=index;get("choice").append(option);});
  get("choice").addEventListener("change",()=>{get("target").value=examples[Number(get("choice").value)].target;update();});
  const edited=()=>{clearTimeout(timer);current=null;get("work").hidden=true;get("try").disabled=true;delete get("try").dataset.example;timer=setTimeout(update,180);};
  get("target").addEventListener("input",edited);get("target").addEventListener("ufn-input",edited);
  get("next").addEventListener("click",()=>{if(current&&visit<current.stages.length-1){visit++;draw();}});
  get("back").addEventListener("click",()=>{if(current&&visit){visit--;draw();}});
  get("restart").addEventListener("click",()=>{if(current){visit=0;draw();}});
  panel.hidden=false;update();
})(typeof globalThis!=="undefined"?globalThis:this);
