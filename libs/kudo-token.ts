import { KudoData } from '@/interfaces/kudo-token'

export function generateSvgFromKudoData(data: KudoData) {
  return svg
    .replace(FROM_ADDRESS_KEY, data.fromAddress)
    .replace(TO_ADDRESS_KEY, data.toAddress)
    .replace(REASON_MESSAGE_KEY, data.reason)
}

export function generateMetadata(data: KudoData, svgCid: string) {
  return {
    name: 'KudoToken',
    description: `Kudo sent to ${data.toAddress} by ${data.fromAddress}`,
    image: 'ipfs://' + svgCid,
    imageGateway: process.env.INFURA_GATEWAY + '/' + svgCid,
    attributes: {
      trait_type: 'Reason',
      value: data.reason,
    },
  }
}

const FROM_ADDRESS_KEY = '{FROM_ADDRESS}'
const TO_ADDRESS_KEY = '{TO_ADDRESS}'
const REASON_MESSAGE_KEY = '{REASON_MESSAGE}'
const svg = `<svg viewBox="0 0 350 350" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="350" height="135" style="fill: rgb(0, 0, 0); stroke: rgb(0, 0, 0);"></rect>
<text style="white-space: pre; fill: rgb(249 250 251); font-family: Arial, sans-serif; font-size: 16px;" x="0" y="0"
    transform="matrix(1, 0, 0, 1, 20, 50)">From:</text>
<text
    style="white-space: pre; fill: rgb(249 250 251); font-family: Arial, sans-serif; font-size: 12px;" x="0" y="0"
    transform="matrix(1, 0, 0, 1, 20, 80)">${FROM_ADDRESS_KEY}</text>
<rect x="0" y="135" width="350" height="135" style="fill: rgb(0 110 255); stroke: rgb(0, 0, 0);"></rect>
<text style="white-space: pre; fill: rgb(0 0 0); font-family: Arial, sans-serif; font-size: 16px;" x="0" y="0"
    transform="matrix(1, 0, 0, 1, 20, 185)">To:</text>
<text style="white-space: pre; fill: rgb(0 0 0); font-family: Arial, sans-serif; font-size: 12px;"
    x="0" y="0" transform="matrix(1, 0, 0, 1, 20, 215)">${TO_ADDRESS_KEY}</text>
<rect y="270" width="350" height="80" style="fill: rgb(249 250 251); stroke: rgb(0, 0, 0);" x="0"></rect>
<text style="white-space: pre; fill: rgb(0 110 255); font-family: Arial, sans-serif; font-size: 16px;" x="0" y="0"
    transform="matrix(1, 0, 0, 1, 20, 300)">Reason:</text>
<text
    style="white-space: pre; fill: rgb(0 110 255); font-family: Arial, sans-serif; font-size: 12px;" x="0" y="0"
    transform="matrix(1, 0, 0, 1, 20, 325)">${REASON_MESSAGE_KEY}</text>
</svg>`
