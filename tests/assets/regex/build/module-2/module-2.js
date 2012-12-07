YUI.add('module-2', function (Y, NAME) {

  if (true) {
    console.log("want to see this 1");
    console.log("dont want to see this 1");  /*@DBG*/
    console.log("want to see this 2");  /*@DBG */
    console.log("want to see this 3");  /*DBG*/
    console.log("want to see this 4");
    console.log("dont want to see this 2"); /*@DBG*/ if (true) { alert("hi");}
    console.log("want to see this 5"); /*@DBG@*/
    console.log("dont want to see this 3"); //*@DBG*/
    console.log("want /*@DBG*/ to see this 6");
   /*@DBG*/ console.log("dont want to see this 4");
    console.log("dont want /*@DBG*/ to see this 5");
  }



}, '@VERSION@', {"skinnable": true});
