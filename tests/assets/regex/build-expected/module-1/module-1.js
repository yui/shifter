YUI.add('module-1', function (Y, NAME) {

  if (true) {
    console.log("want to see this 1");
    console.log("want to see this 2");  /*@DBG */
    console.log("want to see this 3");  /*DBG*/
    console.log("want to see this 4");
    console.log("want to see this 5"); /*@DBG@*/
  }



}, '@VERSION@', {"skinnable": false});
