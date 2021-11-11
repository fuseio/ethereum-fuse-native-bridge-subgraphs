import { Bytes, BigInt, crypto, ByteArray, log } from '@graphprotocol/graph-ts'
import {
  CollectedSignatures as CollectedSignaturesEvent,
  UserRequestForSignature as UserRequestForSignatureEvent,
  HomeBridgeNativeToErc
} from "../generated/HomeBridgeNativeToErc/HomeBridgeNativeToErc"
import { UserRequestForSignature } from "../generated/schema"
import { createMessage } from "./utils"

export function handleCollectedSignatures(event: CollectedSignaturesEvent): void {
  log.debug('Parsing CollectedSignatures for txHash {}', [
    event.transaction.hash.toHexString(),
  ]);

  let homeBridge = HomeBridgeNativeToErc.bind(event.address)
  let messageHash = event.params.messageHash
  
  let message = homeBridge.try_message(messageHash)
  if (message.reverted) {
    return
  }

  let messageId = crypto.keccak256(message.value)
  let userRequestForSignature = UserRequestForSignature.load(messageId.toHexString())
  if (userRequestForSignature == null) {
    return
  }

  let signatures = new Array<Bytes>()
  for (let i = BigInt.fromI32(0); i.lt(event.params.NumberOfCollectedSignatures); i = i.plus(BigInt.fromI32(1))) {
    let signature = homeBridge.try_signature(messageHash, i)
    if (!signature.reverted) {
      signatures.push(signature.value)
    }
  }

  userRequestForSignature.messageHash = messageHash
  userRequestForSignature.signatures = signatures
  userRequestForSignature.save()
}

export function handleUserRequestForSignature(event: UserRequestForSignatureEvent): void {
  log.debug('Parsing UserRequestForSignature for txHash {}', [
    event.transaction.hash.toHexString(),
  ]);

  let recipient = event.params.recipient
  let txHash = event.transaction.hash
  let value = event.params.value

  let message = createMessage(
    recipient.toHexString(),
    value.toHexString(),
    txHash.toHexString()
  )
  let id = crypto.keccak256(Bytes.fromHexString(message) as Bytes)

  let userRequestForSignature = UserRequestForSignature.load(id.toHexString())
  if (userRequestForSignature == null) {
    userRequestForSignature = new UserRequestForSignature(id.toHexString())
  }

  userRequestForSignature.recipient = recipient
  userRequestForSignature.value = value
  userRequestForSignature.txHash = txHash
  userRequestForSignature.message = Bytes.fromHexString(message) as Bytes
  userRequestForSignature.save()
}
