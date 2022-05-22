export default interface Host {
    hostname: string;
    ipAddress: string;
    macAddress: string;
    wakeOnLanAvailable: string;
    vmHostedBy?: string;
}