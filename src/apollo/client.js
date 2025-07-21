import { ApolloClient, InMemoryCache, createHttpLink, from } from "@apollo/client";
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
	uri: "http://localhost:8080/graphql",
});

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem('authToken');

	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		}
	}
});

const client = new ApolloClient({
	link: from([authLink, httpLink]),
	cache: new InMemoryCache({
		typePolicies: {
			Query: {
				fields: {
					getCurrentUser: {
						merge: false,
					},
					getCurrentUserRole: {
						merge: false,
					},
					doctors: {
						merge: false,
					},
					patients: {
						merge: false,
					}
				}
			}
		}
	}),
	defaultOptions: {
		watchQuery: {
			errorPolicy: "none",
		},
		query: {
			errorPolicy: "none",
		},
		mutate: {
			errorPolicy: "all",
		},
	},
});

export default client;