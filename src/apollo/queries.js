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
            startDate
            endDate
            isActive
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


export const DELETE_DOCTOR = gql`
    mutation DeleteDoctor($id: ID!) {
        deleteDoctor(id: $id)
    }
`;

export const DELETE_PATIENT = gql`
    mutation DeletePatient($id: ID!) {
        deletePatient(id: $id)
    }
`;

export const GET_APPOINTMENTS = gql`
    query GetAppointments($requesterId: ID!) {
        appointments(requesterId: $requesterId) {
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
            branchId
            branchLocation
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
            branchId
            branchLocation
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
            branchId
            branchLocation
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
            branchId
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
            branchId
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

export const GET_HOSPITAL_BRANCHES = gql`
    query GetHospitalBranches {
        hospitalBranches {
            id
            branchCode
            address
            city
            state
            zipCode
            email
            phoneNumber
            isActive
            startedAt
        }
    }
`;

export const GET_ACTIVE_BRANCHES = gql`
    query GetActiveBranches {
        activeBranches {
            id
            branchCode
            address
            city
            state
            zipCode
            email
            phoneNumber
            isActive
            startedAt
        }
    }
`;

export const GET_HOSPITAL_BRANCH = gql`
    query GetHospitalBranch($id: ID!) {
        hospitalBranch(id: $id) {
            id
            branchCode
            address
            city
            state
            zipCode
            email
            phoneNumber
            isActive
            startedAt
        }
    }
`;

export const CREATE_HOSPITAL_BRANCH = gql`
    mutation CreateHospitalBranch($input: HospitalBranchInput!) {
        createHospitalBranch(input: $input) {
            id
            branchCode
            address
            city
            state
            zipCode
            email
            phoneNumber
            isActive
            startedAt
        }
    }
`;

export const UPDATE_HOSPITAL_BRANCH = gql`
    mutation UpdateHospitalBranch($id: ID!, $input: HospitalBranchUpdateInput!) {
        updateHospitalBranch(id: $id, input: $input) {
            id
            branchCode
            address
            city
            state
            zipCode
            email
            phoneNumber
            isActive
            startedAt
        }
    }
`;

export const DELETE_HOSPITAL_BRANCH = gql`
    mutation DeleteHospitalBranch($id: ID!) {
        deleteHospitalBranch(id: $id)
    }
`;

export const GET_DOCTOR_BRANCH_MAPPINGS = gql`
    query GetDoctorBranchMappings {
        doctorBranchMappings {
            id
            doctorId
            branchId
            doctorName
            branchCode
        }
    }
`;

export const GET_DOCTOR_BRANCHES = gql`
    query GetDoctorBranches($doctorId: ID!) {
        doctorBranches(doctorId: $doctorId) {
            id
            doctorId
            branchId
            doctorName
            branchCode
        }
    }
`;

export const GET_BRANCH_DOCTORS = gql`
    query GetBranchDoctors($branchId: ID!) {
        branchDoctors(branchId: $branchId) {
            id
            doctorId
            branchId
            doctorName
            branchCode
        }
    }
`;

export const ASSIGN_DOCTOR_TO_BRANCH = gql`
    mutation AssignDoctorToBranch($input: DoctorBranchMappingInput!) {
        assignDoctorToBranch(input: $input) {
            id
            doctorId
            branchId
            doctorName
            branchCode
        }
    }
`;

export const REMOVE_DOCTOR_FROM_BRANCH = gql`
    mutation RemoveDoctorFromBranch($doctorId: ID!, $branchId: ID!) {
        removeDoctorFromBranch(doctorId: $doctorId, branchId: $branchId)
    }
`;

export const GET_APPOINTMENTS_BY_DATE_RANGE = gql`
    query GetAppointmentsByDateRange($requesterId: ID!, $startDate: String!, $endDate: String!) {
        appointmentsByDateRange(requesterId: $requesterId, startDate: $startDate, endDate: $endDate) {
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

export const GET_APPOINTMENTS_BY_DOCTOR_AND_DATE_RANGE = gql`
    query GetAppointmentsByDoctorAndDateRange($doctorId: ID!, $startDate: String!, $endDate: String!) {
        appointmentsByDoctorAndDateRange(doctorId: $doctorId, startDate: $startDate, endDate: $endDate) {
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

export const GET_APPOINTMENTS_BY_PATIENT_AND_DATE_RANGE = gql`
    query GetAppointmentsByPatientAndDateRange($patientId: ID!, $startDate: String!, $endDate: String!) {
        appointmentsByPatientAndDateRange(patientId: $patientId, startDate: $startDate, endDate: $endDate) {
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

export const GET_APPOINTMENTS_BY_BRANCH_AND_DATE_RANGE = gql`
    query GetAppointmentsByBranchAndDateRange($branchId: ID!, $requesterId: ID!, $startDate: String!, $endDate: String!) {
        appointmentsByBranchAndDateRange(branchId: $branchId, requesterId: $requesterId, startDate: $startDate, endDate: $endDate) {
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

export const GET_APPOINTMENTS_BY_BRANCH_AND_STATUS = gql`
    query GetAppointmentsByBranchAndStatus($branchId: ID!, $status: String!, $requesterId: ID!) {
        appointmentsByBranchAndStatus(branchId: $branchId, status: $status, requesterId: $requesterId) {
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

export const GET_RECEPTIONISTS_BY_BRANCH = gql`
    query GetReceptionistsByBranch($branchId: ID!) {
        receptionistsByBranch(branchId: $branchId) {
            id
            name
            email
            role
            phoneNumber
            age
            createdAt
        }
    }
`;



export const GET_APPOINTMENTS_BY_STATUS = gql`
    query GetAppointmentsByStatus($status: String!, $requesterId: ID!) {
        appointmentsByStatus(status: $status, requesterId: $requesterId) {
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

export const GET_DOCTORS_WITH_BRANCHES = gql`
    query GetDoctorsWithBranches {
        doctors {
            id
            name
            email
            role
            createdAt
        }
        doctorBranchMappings {
            id
            doctorId
            branchId
            doctorName
            branchCode
        }
        hospitalBranches {
            id
            branchCode
            address
            city
            state
            isActive
        }
    }
`;

export const UPDATE_DOCTOR = gql`
    mutation UpdateDoctor($id: ID!, $input: DoctorUpdateInput!) {
        updateDoctor(id: $id, input: $input) {
            id
            name
            email
            role
            isActive
        }
    }
`;

export const GET_CUSTOMER_CARE = gql`
    query GetCustomerCare {
        customerCareStaff {
            id
            name
            email
            role
            createdAt
            isActive
        }
    }
`;

export const GET_APPOINTMENTS_BY_BRANCH = gql`
    query GetAppointmentsByBranch($branchId: ID!, $requesterId: ID!) {
        appointmentsByBranch(branchId: $branchId, requesterId: $requesterId) {
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