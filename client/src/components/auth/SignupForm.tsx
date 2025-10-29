import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  View, 
  Text, 
  StyleSheet,
  Button,
  TextInput,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
} from '@stocksprout/components';
import { Eye, EyeOff } from 'lucide-react';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 448,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  cardHeader: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  form: {
    gap: 24,
  },
  errorAlert: {
    marginBottom: 16,
  },
  formField: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
  },
  inputContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#265FDC',
    borderRadius: 5,
    height: 30.19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  icon: {
    width: 16,
    height: 16,
  },
});

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        username: formData.username,
        email: `${formData.username}@example.com`,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        bankAccountNumber: undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CardHeader style={styles.cardHeader}>
          <CardTitle style={styles.cardTitle}>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.form}>
            {error && (
              <Alert variant="destructive" style={styles.errorAlert}>
                <AlertDescription style={{ color: '#dc2626' }}>{error}</AlertDescription>
              </Alert>
            )}
            
            <View style={styles.formField}>
              <Label htmlFor="firstName" style={styles.label}>First Name</Label>
              <TextInput
                id="firstName"
                value={formData.firstName}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, firstName: text }))}
                placeholder="Enter your first name"
                style={{ paddingRight: 48 }}
              />
            </View>

            <View style={styles.formField}>
              <Label htmlFor="lastName" style={styles.label}>Last Name</Label>
              <TextInput
                id="lastName"
                value={formData.lastName}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, lastName: text }))}
                placeholder="Enter your last name"
                style={{ paddingRight: 48 }}
              />
            </View>

            <View style={styles.formField}>
              <Label htmlFor="username" style={styles.label}>Username</Label>
              <TextInput
                id="username"
                value={formData.username}
                onChangeText={(text: string) => setFormData(prev => ({ ...prev, username: text }))}
                placeholder="Enter your username"
                style={{ paddingRight: 48 }}
              />
            </View>

            <View style={styles.formField}>
              <Label htmlFor="password" style={styles.label}>Password</Label>
              <View style={styles.inputContainer}>
                <TextInput
                  id="password"
                  value={formData.password}
                  onChangeText={(text: string) => setFormData(prev => ({ ...prev, password: text }))}
                  placeholder="Create your password"
                  secureTextEntry={!showPassword}
                  style={{ paddingRight: 48 }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff style={styles.icon} />
                  ) : (
                    <Eye style={styles.icon} />
                  )}
                </Button>
              </View>
            </View>

            <View style={styles.formField}>
              <Label htmlFor="confirmPassword" style={styles.label}>Confirm Password</Label>
              <View style={styles.inputContainer}>
                <TextInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChangeText={(text: string) => setFormData(prev => ({ ...prev, confirmPassword: text }))}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  style={{ paddingRight: 48 }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff style={styles.icon} />
                  ) : (
                    <Eye style={styles.icon} />
                  )}
                </Button>
              </View>
            </View>

            <Button
              variant="default"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
