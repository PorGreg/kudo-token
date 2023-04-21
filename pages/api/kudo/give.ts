import { KudoData } from '@/interfaces/kudo-token'
import { uploadDataToIPFS } from '@/libs/ipfs'
import { generateMetadata, generateSvgFromKudoData } from '@/libs/kudo-token'
import { prisma } from '@/libs/prisma'
import { KUDO_TOKEN_ADDRESS, getKudoTokenContract } from '@/libs/web3'
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
    const metadataCid = await uploadDataToIPFS(JSON.stringify(metadata))

    // mint token with the metadata URL
    const kudoToken = getKudoTokenContract()
    try {
      const params: Parameters<typeof kudoToken.safeMint> = [
        kudoData.fromAddress,
        kudoData.toAddress,
        metadataCid,
      ]
      // static call first to catch possible errors
      await kudoToken.callStatic.safeMint(...params)
      // create a listener to catch the mined transaction's event (Mint)
      const tokenIdPromise = new Promise<number | null>((resolve) => {
        setTimeout(() => resolve(null), 30000)
        kudoToken.on(kudoToken.filters['Mint(uint256,string)'](), (id, cid) => {
          if (cid === metadataCid) {
            resolve(id.toNumber())
          }
        })
      })
      // final call
      const [_mintResult, tokenId] = await Promise.all([
        kudoToken.safeMint(...params),
        tokenIdPromise,
      ])

      // save the minted token
      const token = await prisma.mintedToken.create({
        data: {
          contract: KUDO_TOKEN_ADDRESS,
          tokenId,
          imageCid: svgCid,
          metadataUri: 'ipfs://' + metadataCid,
          ...kudoData,
        },
      })

      return res.status(200).json({ token })
    } catch (e: any) {
      console.error(e)
      const message = e.reason ?? 'Unknown error'
      return res.status(500).json({ message })
    }
  }
  res.status(405).end()
}

export default handler
