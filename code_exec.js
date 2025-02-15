console.log("Code exec loaded");

let __EVAL = (s, context) => {
  return eval(`
    
   
    void (__EVAL = ${__EVAL.toString()}); 

    with (context) {
      (async () => {
        ${s} 
      })();
    }
  `);
};

window.getEval = () => {
  return __EVAL;
}
