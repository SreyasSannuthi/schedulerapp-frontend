import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
    mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            token
            username
            role
            message
        }
    }
`;

export const GET_CURRENT_USER = gql`
    query GetCurrentUser {
        getCurrentUser
    }
`;

export const GET_CURRENT_USER_ROLE = gql`
    query GetCurrentUserRole {
        getCurrentUserRole
    }
`;

export const LOGOUT_MUTATION = gql`
    mutation Logout {
        logout
    }
`;

export const GET_DOCTORS = gql`
    query GetDoctors {
        doctors {
            id
            name
            email
            role
        }
    }
`;

export const GET_PATIENTS = gql`
    query GetPatients {
        patients {
            id
            name
            email
            phoneNumber
            age
            role
        }
    }
`;

export const GET_APPOINTMENTS = gql`
    query GetAppointments($adminId: ID!) {
        appointments(adminId: $adminId) {
            id
            title
            description
            doctorId
            patientId
            doctorName
            patientName
            startTime
            endTime
            status
            createdAt
            updatedAt
            duration
        }
    }
`;


export const GET_APPOINTMENTS_BY_DOCTOR = gql`
    query GetAppointmentsByDoctor($doctorId: ID!) {
        appointmentsByDoctor(doctorId: $doctorId) {
            id
            title
            description
            doctorId
            patientId
            doctorName
            patientName
            startTime
            endTime
            status
            duration
            createdAt
            updatedAt
        }
    }
`;

export const GET_APPOINTMENTS_BY_PATIENT = gql`
    query GetAppointmentsByPatient($patientId: ID!) {
        appointmentsByPatient(patientId: $patientId) {
            id
            title
            description
            doctorId
            patientId
            doctorName
            patientName
            startTime
            endTime
            status
            duration
            createdAt
            updatedAt
        }
    }
`;

export const CHECK_COLLISION = gql`
    query CheckCollision($doctorId: ID!, $patientId: ID!, $startTime: String!, $endTime: String!) {
        checkCollision(doctorId: $doctorId, patientId: $patientId, startTime: $startTime, endTime: $endTime) {
            id
            title
            startTime
            endTime
            doctorName
            patientName
        }
    }
`;

export const CREATE_APPOINTMENT = gql`
    mutation CreateAppointment($input: AppointmentInput!) {
        createAppointment(input: $input) {
            id
            title
            description
            doctorId
            patientId
            doctorName
            patientName
            startTime
            endTime
            status
            createdAt
            updatedAt
            duration
        }
    }
`;

export const UPDATE_APPOINTMENT = gql`
    mutation UpdateAppointment($id: ID!, $input: AppointmentUpdateInput!, $requesterId: ID!) {
        updateAppointment(id: $id, input: $input, requesterId: $requesterId) {
            id
            title
            description
            doctorId
            doctorName
            patientId
            patientName
            startTime
            endTime
            status
            updatedAt
            duration
        }
    }
`;

export const DELETE_APPOINTMENT = gql`
    mutation DeleteAppointment($id: ID!, $requesterId: ID!) {
        deleteAppointment(id: $id, requesterId: $requesterId)
    }
`;

export const DELETE_MULTIPLE_APPOINTMENTS = gql`
    mutation DeleteMultipleAppointments($ids: [ID!]!, $requesterId: ID!) {
        deleteMultipleAppointments(ids: $ids, requesterId: $requesterId)
    }
`;

export const SIGNUP_DOCTOR = gql`
    mutation SignupDoctor($input: DoctorSignupInput!) {
        signupDoctor(input: $input) {
            message
            success
            userId
            email
            role
        }
    }
`;

export const SIGNUP_PATIENT = gql`
    mutation SignupPatient($input: PatientSignupInput!) {
        signupPatient(input: $input) {
            message
            success
            userId
            email
            role
        }
    }
`;