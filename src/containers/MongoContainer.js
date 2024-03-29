import { asPOJO, renameField, removeField } from '../utils/objectUtils.js'

class MongoContainer {
  constructor (esquema) {
    this.coleccion = esquema
  }

  // CREATE
  async create (nuevoElem) {
    try {
      let doc = await this.coleccion.create(nuevoElem)
      doc = asPOJO(doc)
      renameField(doc, '_id', 'id')
      removeField(doc, '__v')
      return doc
    } catch (error) {
      throw new Error(`Error al guardar: ${error}`)
    }
  }

  // READ
  async read (id) {
    try {
      const docs = await this.coleccion.find({ _id: id }, { __v: 0 })
      if (docs.length === 0) {
        throw new Error('Error al listar por id: no encontrado')
      } else {
        const result = renameField(asPOJO(docs[0]), '_id', 'id')
        return result
      }
    } catch (error) {
      throw new Error(`Error al listar por id: ${error}`)
    }
  }

  async readAll () {
    try {
      let docs = await this.coleccion.find({}, { __v: 0 }).lean()
      docs = docs.map(asPOJO)
      docs = docs.map(d => renameField(d, '_id', 'id'))
      return docs
    } catch (error) {
      throw new Error(`Error al listar todo: ${error}`)
    }
  }

  // UPDATE
  async update (nuevoElem) {
    try {
      renameField(nuevoElem, 'id', '_id')
      const { n, nModified } = await this.coleccion.replaceOne({ _id: nuevoElem._id }, nuevoElem)
      if (n === 0 || nModified === 0) {
        throw new Error('Error al actualizar: no encontrado')
      } else {
        renameField(nuevoElem, '_id', 'id')
        removeField(nuevoElem, '__v')
        return asPOJO(nuevoElem)
      }
    } catch (error) {
      throw new Error(`Error al actualizar: ${error}`)
    }
  }

  // DELETE
  async delete (id) {
    try {
      const { n, nDeleted } = await this.coleccion.deleteOne({ _id: id })
      if (n === 0 || nDeleted === 0) {
        throw new Error('Error al borrar: no encontrado')
      }
    } catch (error) {
      throw new Error(`Error al borrar: ${error}`)
    }
  }

  async deleteAll () {
    try {
      await this.coleccion.deleteMany({})
    } catch (error) {
      throw new Error(`Error al borrar: ${error}`)
    }
  }
}

export default MongoContainer
