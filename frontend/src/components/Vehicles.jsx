import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { vehiclesActions } from '../store/store';

const Vehicles = ({ user }) => {
  const dispatch = useDispatch();
  const { vehicles, loading, error } = useSelector(state => state.vehicles);
  
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    color: '',
    mileage: 0,
    status: 'available',
    location: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    dispatch(vehiclesActions.fetchVehiclesStart());
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        dispatch(vehiclesActions.fetchVehiclesSuccess(data));
      } else {
        throw new Error('Failed to fetch vehicles');
      }
    } catch (error) {
      dispatch(vehiclesActions.fetchVehiclesFailure(error.message));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingVehicle 
        ? `/api/vehicles/${editingVehicle.id}`
        : '/api/vehicles';
      
      const method = editingVehicle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (editingVehicle) {
          dispatch(vehiclesActions.updateVehicle(data.vehicle));
        } else {
          dispatch(vehiclesActions.addVehicle(data.vehicle));
        }
        
        resetForm();
        fetchVehicles();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Operation failed');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate || '',
      color: vehicle.color || '',
      mileage: vehicle.mileage,
      status: vehicle.status,
      location: vehicle.location || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      license_plate: '',
      color: '',
      mileage: 0,
      status: 'available',
      location: ''
    });
    setEditingVehicle(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_service': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'in_service': return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z';
      case 'maintenance': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
      case 'sold': return 'M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11H6a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2v-6a2 2 0 00-2-2h-2';
      default: return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7h3v6h-3M5 7H2v6h3m0-6v6m0-6h14m-9 6h4" />
                </svg>
                Vehicle Fleet Management
              </h1>
              <p className="text-gray-600">Manage your vehicle inventory and track status</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search vehicles by make, model, license plate, or VIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in_service">In Service</option>
                <option value="maintenance">Maintenance</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-2xl bg-white">
              <div className="mt-3">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7h3v6h-3M5 7H2v6h3m0-6v6m0-6h14m-9 6h4" />
                  </svg>
                  {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Make</label>
                      <input
                        type="text"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Toyota"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Model</label>
                      <input
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Camry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                      <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">VIN</label>
                      <input
                        type="text"
                        name="vin"
                        value={formData.vin}
                        onChange={handleChange}
                        required
                        maxLength="17"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="17-character VIN"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                      <input
                        type="text"
                        name="license_plate"
                        value={formData.license_plate}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., ABC123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Silver"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (km)</label>
                      <input
                        type="number"
                        name="mileage"
                        value={formData.mileage}
                        onChange={handleChange}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="available">Available</option>
                        <option value="in_service">In Service</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="sold">Sold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Lot A, Service Bay 1"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      {editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(vehicle.status)}`}>
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getStatusIcon(vehicle.status)} />
                    </svg>
                    {vehicle.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">VIN:</span>
                    <span className="ml-1 font-mono">{vehicle.vin}</span>
                  </div>
                  
                  {vehicle.license_plate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="font-medium">Plate:</span>
                      <span className="ml-1 font-mono">{vehicle.license_plate}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="font-medium">Mileage:</span>
                    <span className="ml-1">{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                  
                  {vehicle.color && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                      <span className="font-medium">Color:</span>
                      <span className="ml-1">{vehicle.color}</span>
                    </div>
                  )}
                  
                  {vehicle.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">{vehicle.location}</span>
                    </div>
                  )}
                </div>

                {user.is_admin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7h3v6h-3M5 7H2v6h3m0-6v6m0-6h14m-9 6h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first vehicle to the fleet'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Vehicle
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Vehicles;