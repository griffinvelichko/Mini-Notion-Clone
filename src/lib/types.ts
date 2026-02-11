export type BlockType = 'text' | 'image'
export type BlockStyle = 'paragraph' | 'h1' | 'h2' | 'h3'

export interface Block {
  id: string
  type: BlockType
  content: string
  style?: BlockStyle
  width?: number
  height?: number
}

export interface Page {
  id: string
  title: string
  blocks: Block[]
  createdAt: string
  updatedAt: string
}

export interface Database {
  pages: Page[]
}
