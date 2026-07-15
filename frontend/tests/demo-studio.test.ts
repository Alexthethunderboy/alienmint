import test from "node:test";import assert from "node:assert/strict";
import {clampQuantity,maxMintQuantity,nextMintStage} from "../src/lib/demo-mint.ts";
import {serializeTraits,tokenMetadata,validateArtwork} from "../src/lib/studio.ts";
test("demo mint respects transaction and sold-out boundaries",()=>{assert.equal(clampQuantity(9,100,5),5);assert.equal(clampQuantity(-1,3,5),1);assert.equal(maxMintQuantity(0,5),0);assert.equal(clampQuantity(2,0,5),0)});
test("demo workflow confirms, completes, and resets",()=>{let s=nextMintStage("idle","begin");s=nextMintStage(s,"confirm");s=nextMintStage(s,"complete");assert.equal(s,"success");assert.equal(nextMintStage(s,"reset"),"idle")});
test("studio validates files and serializes only complete traits",()=>{assert.equal(validateArtwork({name:"x.png",type:"image/png",size:42}),null);assert.match(validateArtwork({name:"x.svg",type:"image/svg+xml",size:42})!,/PNG/);assert.deepEqual(serializeTraits([{attribute:"Mood",value:"Calm"},{attribute:"",value:"x"}]),[{trait_type:"Mood",value:"Calm"}])});
test("studio generates standard token metadata",()=>{const m=tokenMetadata({name:"Signals",description:"Glass",externalUrl:"",traits:[]},7);assert.equal(m.name,"Signals #7");assert.equal(m.image,"ipfs://IMAGE_CID/7.png")});
