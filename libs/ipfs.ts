import { create } from 'ipfs-http-client'

export function getIPFSClient() {
  const projectId = process.env.INFURA_API_KEY
  const projectSecret = process.env.INFURA_API_SECRET
  const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
  return create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  })
}

export async function uploadDataToIPFS(data: string) {
  const client = getIPFSClient()
  return (await client.add(data)).cid.toV1().toString()
}
