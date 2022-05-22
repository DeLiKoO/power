import * as fs from 'fs';
import Host from "./Host";
import HostAdapter from './HostAdapter';
import HostStats from './HostStats';
import hostAdapterFactory from './hostAdapterFactory';

async function readHostsConfig() {
    const hosts: Host[] = JSON.parse(fs.readFileSync(__dirname + "/../hosts.json", "utf8"));
    return hosts;
}

async function scan(hosts: Host[]): Promise<HostStats[]> {
    const result: HostStats[] = [];
    for (const host of hosts) {
        const adapter = hostAdapterFactory(host);
        let pingResult: HostAdapter.PingResult | undefined = undefined;
        if(adapter.ping !== undefined) {
            pingResult = await adapter.ping();
        }
        result.push({
            ...host,
            pingResult,
            reachable: pingResult !== undefined && pingResult.percentLoss < 100 ? true : false,
        });
    }
    return result;
}

async function main() {
    const hosts: Host[] = await readHostsConfig();
    const scanResult: HostStats[] = await scan(hosts);
    console.table(scanResult.map(sr => ({
        ...sr,
        pingResult: sr.pingResult === undefined ? '/' : sr.pingResult.avg,
    })));
}

main();