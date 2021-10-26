/*

the hope and point of this is importing deno modules in browser

would need to use babel/typescript to remove the TS before this will work

*/

// this is application/typescript but needs application/javascript
import { assertEquals } from "https://deno.land/std@0.113.0/testing/asserts.ts";

const foo = assertEquals(true, true);
