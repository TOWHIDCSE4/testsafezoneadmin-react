const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL
const BACKEND_TRIAL_TEST_API_URL = `${process.env.REACT_APP_LIBRARY_TEST_BASE_URL}/api/v1`

export const ROUTE_ALIAS = {
    '/core/': BACKEND_API_URL,
    '/trial-test/': BACKEND_TRIAL_TEST_API_URL
}
