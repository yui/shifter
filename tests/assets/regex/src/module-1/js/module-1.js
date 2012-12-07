  if (true) {
    console.log("want to see this 1");
    console.log("dont want to see this 1");  /*@DBG*/
    console.log("want to see this 2");  /*@DBG */
    console.log("want to see this 3");  /*DBG*/
    console.log("want to see this 4");
    console.log("dont want to see this 2"); /*@DBG*/ if (true) { alert("hi");}
    console.log("want to see this 5"); /*@DBG@*/
    console.log("dont want to see this 3"); //*@DBG*/
   /*@DBG*/ console.log("dont want to see this 4");
    console.log("dont want /*@DBG*/ to see this 5");
  }

  var i = 0; Y.log("hello 1!", "info", "AVE AVE");
  var j = 0; Y.log("hello 2!", "info", "AVE AVE"); /*@DBG*/
  var j = 0; Y.log("hello 3!", "info", "AVE AVE");
