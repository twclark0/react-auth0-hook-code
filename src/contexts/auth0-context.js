import React, { Component, createContext, useContext } from 'react'
import createAuth0Client from '@auth0/auth0-spa-js'

// create the context
export const Auth0Context = createContext()
export const useAuth0 = () => useContext(Auth0Context)

// create a provider
export class Auth0Provider extends Component {
  state = {
    auth0Client: null,
    isLoading: true,
    isAuthenticated: false,
    user: null
  }
  config = {
    domain: 'dev-56co2w2u.auth0.com',
    client_id: '7gUzWw9ldqtX3Tlrh0nJp9advjdb6oub',
    redirect_uri: window.location.origin
  }

  componentDidMount() {
    this.initializeAuth0()
  }

  // initialize the auth0 library
  initializeAuth0 = async () => {
    const auth0Client = await createAuth0Client(this.config)
    this.setState({ auth0Client })

    // check to see if they have been redirected after login
    if (window.location.search.includes('code=')) {
      return this.handleRedirectCallback()
    }

    const isAuthenticated = await auth0Client.isAuthenticated()
    const user = isAuthenticated ? await auth0Client.getUser() : null
    this.setState({ isLoading: false, isAuthenticated, user })
  }

  handleRedirectCallback = async () => {
    this.setState({ isLoading: true })

    await this.state.auth0Client.handleRedirectCallback()
    const user = await this.state.auth0Client.getUser()

    this.setState({ user, isAuthenticated: true, isLoading: false })
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  render() {
    const { auth0Client, isLoading, isAuthenticated, user } = this.state
    const { children } = this.props

    const configObject = {
      isLoading,
      isAuthenticated,
      user,
      loginWithRedirect: (...e) => auth0Client.loginWithRedirect(...e),
      getTokenSilently: (...e) => auth0Client.getTokenSilently(...e),
      getIdTokenClaims: (...e) => auth0Client.getIdTokenClaims(...e),
      logout: (...e) => auth0Client.logout(...e)
    }

    return (
      <Auth0Context.Provider value={configObject}>
        {children}
      </Auth0Context.Provider>
    )
  }
}
