import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { GET_ACTIVITY_LOGS, GET_ACTIVITY_LOGS_BY_TYPE } from '../apollo/queries';
import { useToast } from '../components/Toast';
import {
    Activity,
    User,
    Filter,
    AlertCircle,
    CheckCircle,
    XCircle,
    Plus,
    Minus,
    Building2,
    UserCheck
} from 'lucide-react';

function ActivityLogs() {
    const { showSuccess, showError } = useToast();
    const [selectedType, setSelectedType] = useState('all');

    const { data: allLogs, loading: loadingAll, error: errorAll } = useQuery(GET_ACTIVITY_LOGS, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (data?.getActivityLogs?.length > 0) {
                showSuccess(`${data.getActivityLogs.length} activity logs loaded successfully`);
            }
        },
        onError: (error) => {
            console.error('Error loading logs:', error);
            showError(`Failed to load logs: ${error.message}`);
        }
    });

    const [fetchLogsByType, { data: filteredLogs, loading, error }] = useLazyQuery(GET_ACTIVITY_LOGS_BY_TYPE, {
        fetchPolicy: 'cache-and-network',
        onCompleted: (data) => {
            if (selectedType !== 'all' && data?.getActivityLogsByType?.length > 0) {
                showSuccess(`${data.getActivityLogsByType.length} ${selectedType.replace('_', ' ').toLowerCase()} logs loaded successfully`);
            }
        },
        onError: (error) => {
            console.error('Error filtering logs:', error);
            showError(`Failed to filter logs: ${error.message}`);
        }
    });

    const handleChange = (e) => {
        setSelectedType(e.target.value);
    };

    useEffect(() => {
        if (selectedType !== 'all') {
            fetchLogsByType({ variables: { entityType: selectedType } });
        }
    }, [selectedType, fetchLogsByType]);

    const logsToDisplay = useMemo(() => {
        return selectedType === 'all'
            ? allLogs?.getActivityLogs
            : filteredLogs?.getActivityLogsByType;
    }, [selectedType, allLogs, filteredLogs]);

    const isLoading = loading || loadingAll;
    const isError = error || errorAll;

    const getActivityIcon = (actionType) => {
        switch (actionType) {
            case 'DEACTIVATED':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'REACTIVATED':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'MAPPING_CREATED':
                return <Plus className="w-5 h-5 text-blue-600" />;
            case 'MAPPING_REMOVED':
                return <Minus className="w-5 h-5 text-orange-600" />;
            default:
                return <Activity className="w-5 h-5 text-gray-600" />;
        }
    };

    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'DEACTIVATED':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'REACTIVATED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'MAPPING_CREATED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'MAPPING_REMOVED':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatEntityType = (entityType) => {
        return entityType ? entityType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : '';
    };

    const formatActionType = (actionType) => {
        switch (actionType) {
            case 'DEACTIVATED':
                return 'Deactivated';
            case 'REACTIVATED':
                return 'Reactivated';
            case 'MAPPING_CREATED':
                return 'Assignment Created';
            case 'MAPPING_REMOVED':
                return 'Assignment Removed';
            default:
                return actionType?.replace(/_/g, ' ') || '';
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return 'No timestamp';

        return new Date(timestamp).toLocaleString('en-GB', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Activity className="w-6 h-6 mr-2" />
                        Activity Logs
                    </h2>
                    <p className="text-gray-600">Track all system changes and user activities</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{logsToDisplay?.length || 0} activities found</span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <label className="text-sm font-medium text-gray-700">Filter by type:</label>
                    <select
                        onChange={handleChange}
                        value={selectedType}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        disabled={isLoading}
                    >
                        <option value="all">All Activities</option>
                        <option value="HOSPITAL_STAFF">Staff Changes</option>
                        <option value="HOSPITAL_BRANCH">Branch Changes</option>
                        <option value="STAFF_BRANCH_MAPPING">Staff Assignments</option>
                    </select>
                    {isLoading && (
                        <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            <span className="text-sm">Loading...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
                            <p className="text-gray-600">Loading activity logs...</p>
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-red-800 font-medium">Error Loading Activity Logs</h3>
                                <p className="text-red-600 text-sm">
                                    {error?.message || errorAll?.message || "Error while fetching the data"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && logsToDisplay?.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border">
                        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activities Found</h3>
                        <p className="text-gray-600">
                            {selectedType === 'all'
                                ? 'No activity logs available in the system.'
                                : `No activity logs found for ${formatEntityType(selectedType)}.`
                            }
                        </p>
                    </div>
                )}

                {!isLoading && logsToDisplay?.length > 0 && (
                    <div className="space-y-3">
                        {logsToDisplay.map((log) => (
                            <div key={log.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className="flex-shrink-0 mt-1">
                                            {getActivityIcon(log.actionType)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <span className="text-sm font-medium text-gray-600">
                                                    {formatEntityType(log.entityType)}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.actionType)}`}>
                                                    {formatActionType(log.actionType)}
                                                </span>
                                            </div>

                                            <h3 className="text-gray-900 font-medium mb-3 text-base leading-relaxed">
                                                {log.description}
                                            </h3>

                                            {log.impactSummary && (
                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-700">
                                                        <span className="font-medium">Impact:</span> {log.impactSummary}
                                                    </p>
                                                </div>
                                            )}

                                            {(log.actionType === 'DEACTIVATED' || log.actionType === 'REACTIVATED') && (
                                                <div className="mb-3 space-y-2 text-sm">
                                                    {log.staffName && log.staffRole && (
                                                        <div >
                                                            <div className="flex items-center">
                                                                <UserCheck className="w-4 h-4 mr-2 text-gray-700" />
                                                                <span className="font-medium text-gray-700">Staff:</span>
                                                                <span className="ml-2">
                                                                    {log.staffName} ({log.staffRole})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {log.branchCode && log.branchLocation && (
                                                        <div>
                                                            <div className="flex items-center">
                                                                <Building2 className="w-4 h-4 text-gray-600 mr-2" />
                                                                <span className="font-medium text-gray-700">Branch:</span>
                                                                <span className="ml-2">
                                                                    {log.branchCode} - {log.branchLocation}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-700">Current Status:</span>
                                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                                            log.actionType === 'REACTIVATED'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {log.actionType === 'REACTIVATED' ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {(log.actionType === 'MAPPING_CREATED' || log.actionType === 'MAPPING_REMOVED') && (
                                                <div className="mb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {log.staffName && (
                                                            <div className="flex items-center">
                                                                <UserCheck className="w-4 h-4 text-gray-600 mr-1" />
                                                                <span className="font-medium text-gray-700">Staff:</span>
                                                                <span className="ml-2 text-gray-700">
                                                                    {log.staffName}
                                                                    {log.staffRole && (
                                                                        <span className="text-gray-600 ml-1">({log.staffRole})</span>
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {log.branchCode && (
                                                            <div className="flex items-center">
                                                                <Building2 className="w-4 h-4 text-gray-600 mr-1" />
                                                                <span className="font-medium text-gray-700">Branch:</span>
                                                                <span className="ml-2 text-gray-700">{log.branchCode}</span>
                                                            </div>
                                                        )}

                                                        {log.branchLocation && (
                                                            <div className="flex items-center md:col-span-2">
                                                                <span className="font-medium text-gray-700">Location:</span>
                                                                <span className="ml-2 text-gray-600">{log.branchLocation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 mr-1.5" />
                                                    <span>By <span className="font-medium text-gray-700">{log.performedByName}</span></span>
                                                </div>
                                                <span>{formatTimestamp(log.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivityLogs;