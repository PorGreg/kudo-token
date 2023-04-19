import { KudoData } from '@/interfaces/kudo-token'
import { uploadDataToIPFS } from '@/libs/ipfs'
import { generateMetadata, generateSvgFromKudoData } from '@/libs/kudo-token'
import { getKudoTokenContract } from '@/libs/web3'
import { NextApiHandler } from 'next'

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const body = req.body as Partial<KudoData>
    if (!body.fromAddress || !body.toAddress || !body.reason) {
      return res.status(400).end()
    }
    const kudoData = body as KudoData

    // generate SVG image and upload to IPFS
    const svg = generateSvgFromKudoData(kudoData)
    const svgCid = await uploadDataToIPFS(svg)

    // generate metadata and upload to IPFS
    const metadata = generateMetadata(kudoData, svgCid)
    const metadataJson = JSON.stringify(metadata)
    const metadataIpfs = 'ipfs://' + (await uploadDataToIPFS(metadataJson))

    // mint token with the metadata URL
    const kudoToken = getKudoTokenContract()
    try {
      const params: Parameters<typeof kudoToken.safeMint> = [
        kudoData.fromAddress,
        kudoData.toAddress,
        metadataIpfs,
      ]
      // static call first to check possible errors
      await kudoToken.callStatic.safeMint(...params)
      // final call
      const result = await kudoToken.safeMint(...params)
      return res.status(200).json(result)
    } catch (e: any) {
      console.error(e)
      const message = e.reason ?? 'Unknown error'
      return res.status(500).json({ message })
    }
  }
  res.status(405).end()
}

export default handler
