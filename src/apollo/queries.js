import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      displayName
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      displayName
    }
  }
`;

export const GET_APPOINTMENTS = gql`
  query GetAppointments($userId: ID!) {
    appointments(userId: $userId) {
      id
      title
      description
      userId
      userName
      startTime
      endTime
      status
      category
      categoryColor
      duration
    }
  }
`;