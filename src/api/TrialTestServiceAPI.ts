import * as store from 'utils/storage'
import axios, { AxiosResponse, AxiosError } from 'axios'

const TRIAL_TEST_URL = process.env.REACT_APP_TRIAL_TEST_API_URL

const queryString = require('query-string')

export default class TrialTestServiceAPI {
    public static async getLibraryTopics(payload: object) {
        const data = []
        const response = await TrialTestServiceAPI.getTopics(payload)
        if (response) {
            data.push(response.data.data.data)
            if (response.data.next_page_url !== null) {
                const nextRes = await TrialTestServiceAPI.getTopics({
                    page: 2
                })
                if (nextRes) {
                    data.push(nextRes.data.data.data)
                    if (nextRes.data.next_page_url !== null) {
                        const lastRes = await TrialTestServiceAPI.getTopics({
                            page: 3
                        })
                        if (lastRes) {
                            data.push(lastRes.data.data.data)
                        }
                    }
                }
            }
        }

        return data.flat().filter((i) => i.section_ids !== null)
    }

    private static async getTopics(params: Object) {
        try {
            axios.defaults.baseURL = TRIAL_TEST_URL
            axios.defaults.headers.common.authorization =
                store.get('library_test_token')
            const response = await axios.get(
                '/core/admin/trial-test/all-topic',
                {
                    params,
                    paramsSerializer(_params) {
                        return queryString.stringify(_params, {
                            skipNull: true,
                            skipEmptyString: true
                        })
                    }
                }
            )

            if (response.status === 200 && response.data.code === '10000') {
                return response
            }
        } catch (error) {
            console.error(error)
        }

        return null
    }

    public static async saveTrialTestQuestion(payload: object) {
        try {
            axios.defaults.baseURL = TRIAL_TEST_URL
            const AUTH_TOKEN = store.get('library_test_token')
            axios.defaults.headers.common.authorization = AUTH_TOKEN
            axios
                .post(
                    `${TRIAL_TEST_URL}/core/admin/trial-test/save-question`,
                    payload
                )
                .then((res: AxiosResponse) => {
                    console.log(res)
                    if (res.status === 200 && res.data.code === '10000') {
                        console.log(res)
                    }
                })
                .catch((error: AxiosError) => {
                    console.log(error)
                })
        } catch (error) {
            console.error(error)
        }
    }
}
