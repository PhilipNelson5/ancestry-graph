#!/usr/bin/env node
  
import fs from 'fs'
import {exec} from 'child_process'

const run = command => 
  exec(command, (error, stdout, stderr) => {
    if (error) { console.log(`error: ${error.message}`); return; }
    if (stderr) { console.log(`stderr: ${stderr}`); return; }
    console.log(`${stdout}`);
  })

const print = console.log;
const noexcept = f => { try { f(); } catch (e) { } };

const file = "data.json"
const data = JSON.parse(fs.readFileSync(file)).ancestors;

const people = data
  .flat()
  .map(couple => {
    return [couple.parent1, couple.parent2];
  })
  .flat();

people.unshift({id: 0, name:"root"});

const added = new Map();
let graph = 'digraph {';

people.forEach((person, i) => {
  if (person === undefined) return;
  if (added.has(person.id)) return;
  added.set(person.id, true);
  noexcept(() => {
    if (person.gender == "MALE")
      graph += `"${person.id}"[color="blue"];`
    else if (person.gender == "FEMALE")
      graph += `"${person.id}"[color="pink"];`
  })
  noexcept(() => graph += `"${people[i*2+1].id}"->"${person.id}";`)
  noexcept(() => graph += `"${people[i*2+2].id}"->"${person.id}";`)
});

graph += '}'

const graphfile = 'graph.dot'
fs.writeFileSync(graphfile, graph)
run(`dot -Tpng -Grankdir=RL ${graphfile} -o graph.png`)