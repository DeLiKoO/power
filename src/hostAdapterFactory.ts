import Host from './Host';
import HostAdapter from './HostAdapter';
import wol from 'wol';
import { exec } from 'child_process';

export default function hostAdapterFactory(host: Host): HostAdapter {
    let powerOn: HostAdapter.PowerOn | undefined = undefined;
    let powerOff: HostAdapter.PowerOff | undefined = undefined;
    let isUp: HostAdapter.IsUp | undefined = undefined;
    let ping: HostAdapter.Ping | undefined = undefined;
    
    if(host.wakeOnLanAvailable) {
        powerOn = () => {
            wol.wake(host.macAddress, (err, res) => {
                console.log(res);
            });
        };
    }
    
    if(host.ipAddress) {
        ping = () => new Promise((resolve, reject) => {
            const cmd = `ping -c 4 ${host.ipAddress}`;
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    return reject(error);
                }
                if (stderr) {
                    // TODO: Check whether it should be treated as a ping result, and if we have to resolve.
                    return reject(new Error(stderr));
                }

                const timingsRegExp = /rtt min\/avg\/max\/mdev = ([0-9\.]+)\/([0-9\.]+)\/([0-9\.]+)\/([0-9\.]+) ms/;
                const resultStr: string = stdout.toString();
                const timingsMatch = timingsRegExp.exec(resultStr);
                if(timingsMatch === null || timingsMatch.length < 5) {
                    return reject(new Error(`Unparseable result from ping command: ${resultStr}`));
                }

                const percentLossRegExp = /([0-9]+(\.[0-9]+)?)% packet loss/;
                const percentLossMatch = percentLossRegExp.exec(resultStr);
                if(percentLossMatch === null || percentLossMatch.length < 2) {
                    return reject(new Error(`Unparseable result from ping command: ${resultStr}`));
                }

                console.log(percentLossMatch);

                const result: HostAdapter.PingResult = {
                    min: Number.parseFloat(timingsMatch[1]),
                    avg: Number.parseFloat(timingsMatch[2]),
                    max: Number.parseFloat(timingsMatch[3]),
                    mdev: Number.parseFloat(timingsMatch[4]),
                    percentLoss: Number.parseFloat(percentLossMatch[1]),
                };

                resolve(result);
            })
        });

    }

    return {
        powerOn,
        powerOff,
        isUp,
        ping,
    };
}