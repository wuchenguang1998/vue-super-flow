/**
 * User: CHT
 * Date: 2020/5/8
 * Time: 14:00
 */

import GraphEvent from './GraphEvent'
import GraphNode from './GraphNode'
import GraphLink from './GraphLink'

import {
  arrayReplace,
  vector
} from './utils'


class Graph extends GraphEvent {
  constructor(options) {
    
    const {
      nodeList = [],
      linkList = [],
      width,
      height,
      origin = null
    } = options
    
    super()
    
    this.nodeList = []
    this.linkList = []
    this.width = width
    this.height = height
    
    this.origin = origin || [
      Math.floor(width / 2),
      Math.floor(height / 2)
    ]
    
    this.mouseonLink = null
    this.mouseonNode = null
    
    this.vertex = null
    this.initNode(nodeList)
    this.initLink(linkList)
  }
  
  pointMap() {
    const map = {}
    this.nodeList.forEach(point => {
      map[point.id] = point
    })
    return map
  }
  
  initNode(nodeList) {
    arrayReplace(this.nodeList, nodeList.map(node => this.createNode(node)))
  }
  
  initLink(linkList) {
    const list = []
    linkList.forEach(link => {
      
      const {
        startId = '',
        endId = '',
        startAt = [0, 0],
        endAt = [0, 0],
        meta = null
      } = link
      
      const pointMap = this.pointMap()
      
      const start = pointMap[startId]
      const end = pointMap[endId]
      
      if (start && end) {
        list.push(
          this.createLink({
            start,
            end,
            meta,
            startAt,
            endAt
          })
        )
      }
      
    })
    arrayReplace(this.linkList, list)
  }
  
  createNode(options) {
    return new GraphNode(options, this)
  }
  
  createLink(options) {
    return new GraphLink(options, this)
  }
  
  getDepth() {
    const depth = (vertex) => {
      this.linkList.forEach(link => {
        if (link.start === vertex) {
          link.end.depth = vertex.depth + 1
          depth(link.end)
        }
      })
    }
    
    if (this.vertex && this.nodeList.length && this.linkList.length) {
      this.vertex.depth = 0
      depth(this.vertex)
    }
    
    return Math.max(...this.nodeList.map(node => node.depth))
  }
  
  horizontal() {
    const distance = 100
    const maxDept = this.getDepth()
    let i = 0
    while (i <= maxDept) {
      
    }
  }
  
  vertical() {
  
  }
  
  addNode(options) {
    const node = options.constructor === GraphNode
      ? options
      : this.createNode(options)
    
    this.nodeList.push(node)
  }
  
  addLink(options) {
    const newLink = options.constructor === GraphLink
      ? options
      : this.createLink(options)
    
    const currentLink = this.linkList.find(item => {
      return item.start === newLink.start && item.end === newLink.end
    })
    
    if (currentLink) {
      currentLink.startAt = newLink.startAt
      currentLink.endAt = newLink.endAt
    } else if (newLink.start && newLink.end) {
      this.linkList.push(newLink)
    }
  }
  
  removeNode(node) {
    const idx = this.nodeList.indexOf(node)
    this.linkList.filter(link => {
      return link.start === node || link.end === node
    }).forEach(link => {
      this.removeLink(link)
    })
    this.nodeList.splice(idx, 1)
  }
  
  removeLink(link) {
    const idx = this.linkList.indexOf(link)
    this.linkList.splice(idx, 1)
    if (this.mouseonLink === link) {
      this.mouseonLink = null
    }
  }
  
  toLastNode(idx) {
    const nodeList = this.nodeList
    nodeList.splice(
      nodeList.length - 1, 0,
      ...nodeList.splice(idx, 1)
    )
  }
  
  toJSON() {
    return {
      nodeList: this.nodeList.map(node => {
        return {
          id: node.id,
          width: node.width,
          height: node.height,
          coordinate: [...node.coordinate],
          meta: node.meta
        }
      }),
      linkList: this.linkList.map(link => {
        return {
          startId: link.start.id,
          endId: link.end.id,
          startAt: [...link.startAt],
          endAt: [...link.endAt],
          meta: link.meta
        }
      })
    }
  }
  
  interface() {
    return {
      nodeList: this.nodeList.map(node => node.interface()),
      linkList: this.linkList.map(link => link.interface()),
      addNode: this.addNode.bind(this),
      addLink: this.addLink.bind(this),
      removeNode: this.removeNode.bind(this),
      removeLink: this.removeLink.bind(this),
      horizontal: this.horizontal.bind(this),
      vertical: this.vertical.bind(this),
      toJSON: this.toJSON.bind(this)
    }
  }
}

export default Graph
