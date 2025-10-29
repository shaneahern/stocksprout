import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
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
  Checkbox,
} from '@stocksprout/components';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import { webAuthnService } from '@/lib/webauthn';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 448, // max-w-md = 28rem = 448px
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
    gap: 24, // space-y-6
  },
  errorAlert: {
    marginBottom: 16,
  },
  formField: {
    gap: 8, // space-y-2
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
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // space-x-2
  },
  rememberMeLabel: {
    fontSize: 10,
    fontWeight: '300',
    color: '#000000',
  },
  biometricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space-x-1
  },
  biometricButton: {
    padding: 4,
    height: 'auto',
    backgroundColor: 'transparent',
  },
  biometricIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    width: 24,
    height: 24,
  },
  biometricIconDisabled: {
    opacity: 0.4,
  },
  biometricText: {
    padding: 0,
    height: 'auto',
    color: '#265FDC',
    fontWeight: '300',
    fontSize: 10,
    backgroundColor: 'transparent',
  },
  biometricTextDisabled: {
    color: '#9ca3af',
  },
  linksContainer: {
    gap: 16, // space-y-4
    paddingTop: 24,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // space-x-2
    fontSize: 14,
  },
  linkText: {
    color: '#000000',
    fontSize: 14,
  },
  linkButton: {
    padding: 0,
    height: 'auto',
    color: '#265FDC',
    fontWeight: '500',
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  icon: {
    width: 16,
    height: 16,
    color: '#6b7280',
  },
});

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);

  useEffect(() => {
    const checkBiometricSupport = async () => {
      try {
        const supported = await webAuthnService.isBiometricSupported();
        setIsBiometricSupported(supported);
      } catch (error) {
        console.log('Biometric check failed:', error);
        setIsBiometricSupported(false);
      }
    };

    checkBiometricSupport();
  }, []);

  const handleBiometricAuth = async () => {
    setIsBiometricLoading(true);
    setError('');

    try {
      const mockCredentialIds = ['mock-credential-id'];
      const authResult = await webAuthnService.authenticateBiometric(mockCredentialIds);
      
      if (authResult.success) {
        setError('Biometric authentication successful! Please use your password to complete login.');
      }
    } catch (error: any) {
      const errorMessage = webAuthnService.getErrorMessage(error);
      setError(errorMessage);
    } finally {
      setIsBiometricLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      await login(formData.username, formData.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <CardHeader style={styles.cardHeader}>
          <CardTitle style={styles.cardTitle}>Welcome In</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.form}>
            {error && (
              <Alert variant="destructive" style={styles.errorAlert}>
                <AlertDescription style={{ color: '#dc2626' }}>{error}</AlertDescription>
              </Alert>
            )}
            
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
                  placeholder="Enter your password"
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

            <Button
              variant="default"
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Text>
            </Button>

            <View style={styles.rememberMeRow}>
              <View style={styles.rememberMeContainer}>
                <Checkbox 
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember-me" style={styles.rememberMeLabel} onPress={() => setRememberMe(!rememberMe)}>
                  Remember me
                </Label>
              </View>
              <View style={styles.biometricContainer}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleBiometricAuth}
                  disabled={!isBiometricSupported || isBiometricLoading}
                  style={styles.biometricButton}
                >
                  <View style={[styles.biometricIconContainer, (!isBiometricSupported || isBiometricLoading) && styles.biometricIconDisabled]}>
                    {/* @ts-ignore - Using img for web compatibility */}
                    <img 
                      src="/faceid-icon.png" 
                      alt="Face ID" 
                      style={{
                        width: 24,
                        height: 24,
                        ...((!isBiometricSupported || isBiometricLoading) && { opacity: 0.4 })
                      }}
                    />
                  </View>
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  onPress={handleBiometricAuth}
                  disabled={!isBiometricSupported || isBiometricLoading}
                  style={[styles.biometricText, (!isBiometricSupported || isBiometricLoading) && styles.biometricTextDisabled]}
                >
                  {isBiometricLoading ? 'Authenticating...' : 'Face ID'}
                </Button>
              </View>
            </View>
          </View>
        </CardContent>
      </Card>
      
      <View style={styles.linksContainer}>
        <View style={styles.linkRow}>
          <User style={styles.icon} />
          <Text style={styles.linkText}>Don't have an account? </Text>
          <Button variant="link" onPress={onSwitchToSignup} style={styles.linkButton}>
            Sign up
          </Button>
        </View>
        <View style={styles.linkRow}>
          <Lock style={styles.icon} />
          <Link href="/forgot-password">
            <Button variant="link" style={styles.linkButton}>
              Forgot username or password?
            </Button>
          </Link>
        </View>
      </View>
    </View>
  );
}
