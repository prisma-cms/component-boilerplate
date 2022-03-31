import 'cypress-graphql-mock-network'
import { MockNetworkOptions } from 'cypress-graphql-mock-network'

type initMockServerProps = Omit<MockNetworkOptions, 'schema'> & {
  /**
   * If false, me query returns null
   */
  authed?: boolean
}

export const initMockServer = (props?: initMockServerProps) => {
  const mocks: initMockServerProps['mocks'] = {
    ...((props && props.mocks) || {}),
  }

  if (props?.authed === false) {
    mocks.Query = (source, args, ctx, info) => {
      const fields = {
        me: () => {
          return null
        },
        usersConnection: () => {
          return {
            aggregate: {
              count: 0,
            },
            edges: [],
          }
        },
      }

      if (props && props.mocks && props.mocks.Query) {
        Object.assign(fields, props.mocks.Query(source, args, ctx, info))
      }

      return fields
    }
  }

  const schema = `
    type User {
      id: String!
    }
    
    type Query {
      me: User!
    }
  `

  return cy.mockNetwork({
    schema,
    mocks: {
      DateTime: () => {
        return new Date()
      },
      Json: () => {
        return {}
      },
      ...mocks,
    },
  })
}
