import BaseContentGenerator from './BaseContentGenerator'

class IncrementalGenerator extends BaseContentGenerator {
  constructor(config, fileSystem, contentful, router, renderer) {
    super(config, fileSystem, contentful, router, renderer)
  }

  process(params) {
    return this.readSyncToken()
      .then(syncToken => this.contentful.sync({ initial: !syncToken, nextSyncToken: syncToken }))
      .then(res => this.resolveVariables()
        .then(variables => ({
          variables,
          data: res
        }))
      )
      .then(res => this.retreiveEntries(res))
      .then(res => this.handleUpdates(res))
      .then(() => this.storeSyncToken(res.nextSyncToken))
  }

  retreiveEntries(syncRes) {
    const params = {
      'sys.id[in]': syncRes.entries.map(item => item.sys.id)
    }
    return this.contentful.getEntries(params)
      .then(getEntriesRes => {
        return {
          entries: getEntriesRes.items,
          deletedEntries: syncRes.deletedEntries
        }
      })
  }
}

export default IncrementalGenerator
