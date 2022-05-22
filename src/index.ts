import * as fs from 'fs';
import Host from "./model/Host";

const hosts: Host[] = JSON.parse(fs.readFileSync(__dirname + "/../hosts.json", "utf8"));

console.table(hosts);