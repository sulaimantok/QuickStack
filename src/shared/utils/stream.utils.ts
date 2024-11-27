import { TerminalSetupInfoModel } from "../model/terminal-setup-info.model";

export class StreamUtils {

    static getInputStreamName(terminalInfo: TerminalSetupInfoModel) {
        return `${terminalInfo.namespace}_${terminalInfo.podName}_${terminalInfo.containerName}_input`;
    }

    static getOutputStreamName(terminalInfo: TerminalSetupInfoModel) {
        return `${terminalInfo.namespace}_${terminalInfo.podName}_${terminalInfo.containerName}_output`;
    }
}