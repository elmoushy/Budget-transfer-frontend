/**
 * Controller Service Type Definitions
 */

export interface Currency {
  id: number
  name: string
  icon: string
}

export interface Route {
  id: number
  english_name: string
  arabic_name: string
}

export interface CreateCurrencyData {
  name: string
  icon: string
}

export interface CreateRouteData {
  english_name: string
  arabic_name: string
}

declare const controllerService: {
  // Currency methods
  listCurrencies(): Promise<Currency[]>
  createCurrency(currencyData: CreateCurrencyData): Promise<Currency>
  getCurrency(id: number): Promise<Currency>
  updateCurrency(id: number, currencyData: Partial<Currency>): Promise<Currency>
  deleteCurrency(id: number): Promise<void>

  // Route methods
  listRoutes(): Promise<Route[]>
  createRoute(routeData: CreateRouteData): Promise<Route>
  getRoute(id: number): Promise<Route>
  updateRoute(id: number, routeData: Partial<Route>): Promise<Route>
  deleteRoute(id: number): Promise<void>
}

export default controllerService
