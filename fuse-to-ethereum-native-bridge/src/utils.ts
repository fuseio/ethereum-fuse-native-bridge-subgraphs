import { FOREIGN_BRIDGE_ADDRESS } from "./constants"
import { BigInt, log } from '@graphprotocol/graph-ts'

export function strip0x (input: string): string {
    return input.slice(2)
}

export function padLeft (value: string, length: number): string {
    let paddedStr = ''
    
    for (let i = 0; i < length - value.length; i++) {
        paddedStr += '0'
    }

    return paddedStr + value
}

export function createMessage (recipient: string, value: string, txHash: string): string {
    let foreignBridgeAddress = strip0x(FOREIGN_BRIDGE_ADDRESS)
    recipient = strip0x(recipient)
    value = padLeft(strip0x(value), 32 * 2)
    txHash = strip0x(txHash)
    
    return '0x' + recipient + value + txHash + foreignBridgeAddress
}
