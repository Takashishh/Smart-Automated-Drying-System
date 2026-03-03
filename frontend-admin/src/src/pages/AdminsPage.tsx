import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Shield, CheckCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { AdminLayout } from '../components/layout/AdminLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useAdmins } from '../hooks/useAdmins';
import { type CreateAdminPayload } from '../../api/shared/create-admin';

// Utility function to capitalize first letter
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Utility function to allow only alphabetic characters and spaces
const sanitizeName = (str: string): string => {
  // Only allow letters (a-z, A-Z) and spaces
  return str.replace(/[^a-zA-Z\s]/g, '');
};

export function AdminsPage() {
  const {
    admins,
    loading,
    currentPage,
    totalPages,
    totalItems,
    setCurrentPage,
    createAdmin
  } = useAdmins();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [step, setStep] = useState(1); // Multi-step modal: 1 = Form, 2 = Confirmation
  const [newAdmin, setNewAdmin] = useState<CreateAdminPayload>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');
  const filteredAdmins = admins.filter(admin => {
    const name = `${admin.firstName ?? ''} ${admin.lastName ?? ''}`.toLowerCase();
    const email = admin.email?.toLowerCase() ?? '';
    const term = searchTerm.toLowerCase();

    return name.includes(term) || email.includes(term);
  });
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Email validation - gmail.com only
    const gmailRegex = /^[a-z0-9]+@gmail\.com$/;
    if (!gmailRegex.test(newAdmin.email)) {
      setEmailError('Email must be a valid Gmail address (lowercase, e.g., user@gmail.com)');
      toast.error('Please use a valid Gmail address (e.g., user@gmail.com)');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Your password confirmation doesn\'t match');
      return;
    }

    if (newAdmin.password.length < 8) {
      toast.error('Your password must be at least 8 characters long');
      return;
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|:;"'<>,.?/]).+$/;

    if (!strongPassword.test(newAdmin.password)) {
      toast.error('Use uppercase, lowercase, numbers, and symbols (like !@#) in your password');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdmin(newAdmin);
      setNewAdmin(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        middleName: '',
        password: '',
        confirmPassword: ''
      }));
      setStep(2); // Move to confirmation step
      toast.success('Admin account created and ready to use!');
    } catch (error) {
      toast.error('Couldn\'t create the admin account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setStep(1);
    setEmailError('');
    setNewAdmin({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };
  return <AdminLayout title="Admin Management">
      <div className="mb-6 bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-indigo-600 mt-0.5" />
          <div className="text-sm text-indigo-900">
            <p className="font-semibold mb-1">Super-Admin Control Panel</p>
            <p className="text-indigo-700">
              Manage administrator accounts, monitor activity, and maintain
              system security.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="w-1/3">
          <SearchInput placeholder="Search admins..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Add Admin
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    Loading admins...
                  </td>
                </tr> : filteredAdmins.length === 0 ? <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    No admins found
                  </td>
                </tr> : filteredAdmins.map(admin => {
                  const displayName = (admin.firstName || admin.lastName)
                    ? `${admin.firstName ?? ''} ${admin.middleName ? `${admin.middleName} ` : ''}${admin.lastName ?? ''}`.replace(/\s+/g, ' ').trim()
                    : admin.email;
                  const initial = displayName.charAt(0).toUpperCase();

                  return (
                    <tr key={admin.adminId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                            {initial}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={admin.role === 'super-admin' ? 'primary' : 'neutral'}>
                          {admin.role === 'super-admin' ? 'Super Admin' : 'Admin'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={admin.status === 'active' ? 'success' : 'danger'}>
                          {admin.status === 'active' ? 'Active' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(admin.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/admins/${admin.adminId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" /> View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {Math.max(totalPages, 1)} · {totalItems} total admins
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev: number) => Math.max(prev - 1, 1))}
            disabled={currentPage <= 1 || loading}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev: number) => Math.min(prev + 1, totalPages || 1))}
            disabled={loading || currentPage >= (totalPages || 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Modal isOpen={isCreateModalOpen} onClose={handleCloseModal} title={step === 1 ? 'Add Admin' : 'Admin Added'} maxWidth="lg">
        {step === 1 ? <form onSubmit={handleCreate} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Create admin credentials</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-700">
                    <li>Enter the admin email and a strong password</li>
                    <li>No verification email is sent; credentials work immediately</li>
                    <li>Share the credentials securely and ask them to update the password after first login</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="First Name" 
                value={newAdmin.firstName} 
                onChange={e => setNewAdmin({
                  ...newAdmin,
                  firstName: capitalizeFirstLetter(sanitizeName(e.target.value))
                })} 
                placeholder="John" 
              />
              <Input 
                label="Last Name" 
                value={newAdmin.lastName} 
                onChange={e => setNewAdmin({
                  ...newAdmin,
                  lastName: capitalizeFirstLetter(sanitizeName(e.target.value))
                })} 
                placeholder="Doe" 
              />
            </div>
            <Input 
              label="Middle Name (optional)" 
              value={newAdmin.middleName} 
              onChange={e => setNewAdmin({
                ...newAdmin,
                middleName: capitalizeFirstLetter(sanitizeName(e.target.value))
              })} 
              placeholder="Michael" 
            />

            <Input label="Email Address" type="email" value={newAdmin.email} onChange={e => {
              setNewAdmin({
                ...newAdmin,
                email: e.target.value
              });
              setEmailError('');
            }} error={emailError} required placeholder="user@gmail.com" />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Password" 
                type="password" 
                showPasswordToggle={true}
                value={newAdmin.password} 
                onChange={e => setNewAdmin({
                  ...newAdmin,
                  password: e.target.value
                })} 
                required 
                placeholder="Strong password" 
              />
              <Input 
                label="Confirm Password" 
                type="password" 
                showPasswordToggle={true}
                value={newAdmin.confirmPassword} 
                onChange={e => setNewAdmin({
                  ...newAdmin,
                  confirmPassword: e.target.value
                })} 
                required 
                placeholder="Re-enter password" 
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} leftIcon={<Plus className="h-4 w-4" />}>
                Create Admin
              </Button>
            </div>
          </form> : <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Admin Added Successfully!
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Share the credentials with <strong>{newAdmin.email}</strong>; they can sign in right away.
            </p>
            <div className="bg-gray-50 p-4 rounded-md text-left text-sm text-gray-700 mb-6">
              <p className="font-semibold mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Provide the email and password securely</li>
                <li>Ask the admin to change the password after first login</li>
                <li>Monitor their activity from the Admin dashboard</li>
              </ol>
            </div>
            <Button onClick={handleCloseModal}>Done</Button>
          </div>}
      </Modal>
    </AdminLayout>;
}