import {
  RelayedMessage as RelayedMessageEvent,
} from "../generated/ForeignBridgeNativeToErc/ForeignBridgeNativeToErc"
import { RelayedMessage } from "../generated/schema"

export function handleRelayedMessage(event: RelayedMessageEvent): void {
  let txHash = event.transaction.hash

  let relayedMessage = RelayedMessage.load(txHash.toHexString())
  if (relayedMessage == null) {
    relayedMessage = new RelayedMessage(txHash.toHexString())
  }

  relayedMessage.homeTxHash = event.params.transactionHash
  relayedMessage.recipient = event.params.recipient
  relayedMessage.value = event.params.value
  relayedMessage.save()
}
