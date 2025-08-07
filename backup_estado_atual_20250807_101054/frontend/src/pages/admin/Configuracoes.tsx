import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import AdminSidebar from "@/components/AdminSidebar";
import { 
  Settings, 
  Building, 
  Mail, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  CreditCard,
  Users,
  FileText,
  Save,
  RefreshCw,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { configService, EmailConfig } from "@/services/configService";

const Configuracoes = () => {
  const { toast } = useToast();
  
  // Estados para as configurações
  const [companySettings, setCompanySettings] = useState({
    name: "Imobiliária Firenze",
    email: "contato@imobiliariafirenze.com.br",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - São Paulo, SP",
    cnpj: "12.345.678/0001-90",
    logo: ""
  });

  const [emailSettings, setEmailSettings] = useState<EmailConfig>({
    smtpHost: "",
    smtpPort: "587",
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: ""
  });

  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState({
    loadingConfig: false,
    savingConfig: false,
    testingEmail: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    contractReminders: true,
    paymentReminders: true,
    maintenanceAlerts: true
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    currency: "BRL",
    dateFormat: "DD/MM/YYYY",
    backupFrequency: "daily",
    maintenanceMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordPolicy: "medium",
    loginAttempts: "5",
    ipWhitelist: ""
  });

  const loadEmailConfig = useCallback(async () => {
    setLoading(prev => ({ ...prev, loadingConfig: true }));
    try {
      const config = await configService.getEmailConfig();
      setEmailSettings(config);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, loadingConfig: false }));
    }
  }, [toast]);

  // Carregar configurações de e-mail ao montar o componente
  useEffect(() => {
    loadEmailConfig();
  }, [loadEmailConfig]);

  const handleSaveEmailConfig = async () => {
    setLoading(prev => ({ ...prev, savingConfig: true }));
    try {
      const result = await configService.saveEmailConfig(emailSettings);
      toast({
        title: "Sucesso",
        description: result.mensagem,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, savingConfig: false }));
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Erro",
        description: "Digite um e-mail para teste",
        variant: "destructive",
      });
      return;
    }

    setLoading(prev => ({ ...prev, testingEmail: true }));
    try {
      const result = await configService.testEmailConfig(testEmail);
      toast({
        title: "Sucesso",
        description: result.mensagem,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, testingEmail: false }));
    }
  };

  const handleSave = (section: string) => {
    toast({
      title: "Configurações salvas",
      description: `As configurações de ${section} foram salvas com sucesso.`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
              <p className="text-gray-600">Gerencie as configurações do sistema</p>
            </div>

            <Tabs defaultValue="company" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="company">Empresa</TabsTrigger>
                <TabsTrigger value="email">E-mail</TabsTrigger>
                <TabsTrigger value="notifications">Notificações</TabsTrigger>
                <TabsTrigger value="system">Sistema</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger value="integrations">Integrações</TabsTrigger>
              </TabsList>

              {/* Configurações da Empresa */}
              <TabsContent value="company" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Informações da Empresa
                    </CardTitle>
                    <CardDescription>
                      Configure as informações básicas da sua imobiliária
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Nome da Empresa</Label>
                        <Input
                          id="company-name"
                          value={companySettings.name}
                          onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-email">E-mail</Label>
                        <Input
                          id="company-email"
                          type="email"
                          value={companySettings.email}
                          onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-phone">Telefone</Label>
                        <Input
                          id="company-phone"
                          value={companySettings.phone}
                          onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company-cnpj">CNPJ</Label>
                        <Input
                          id="company-cnpj"
                          value={companySettings.cnpj}
                          onChange={(e) => setCompanySettings({...companySettings, cnpj: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-address">Endereço</Label>
                      <Textarea
                        id="company-address"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <Button onClick={() => handleSave("empresa")} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configurações de E-mail */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Configurações de E-mail
                    </CardTitle>
                    <CardDescription>
                      Configure o servidor SMTP para envio de e-mails
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {loading.loadingConfig ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="ml-2">Carregando configurações...</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="smtp-host">Servidor SMTP</Label>
                            <Input
                              id="smtp-host"
                              placeholder="smtp.gmail.com"
                              value={emailSettings.smtpHost}
                              onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp-port">Porta</Label>
                            <Input
                              id="smtp-port"
                              placeholder="587"
                              value={emailSettings.smtpPort}
                              onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp-user">Usuário</Label>
                            <Input
                              id="smtp-user"
                              placeholder="seu-email@gmail.com"
                              value={emailSettings.smtpUser}
                              onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="smtp-password">Senha</Label>
                            <Input
                              id="smtp-password"
                              type="password"
                              placeholder="Sua senha ou senha de app"
                              value={emailSettings.smtpPassword}
                              onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="from-email">E-mail Remetente</Label>
                            <Input
                              id="from-email"
                              type="email"
                              placeholder="noreply@suaempresa.com"
                              value={emailSettings.fromEmail}
                              onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="from-name">Nome Remetente</Label>
                            <Input
                              id="from-name"
                              placeholder="Sua Empresa"
                              value={emailSettings.fromName}
                              onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="smtp-secure"
                            checked={emailSettings.smtpSecure}
                            onCheckedChange={(checked) => setEmailSettings({...emailSettings, smtpSecure: checked})}
                          />
                          <Label htmlFor="smtp-secure">Usar SSL/TLS</Label>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="text-sm font-medium">Testar Configuração</h4>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Digite um e-mail para teste"
                              value={testEmail}
                              onChange={(e) => setTestEmail(e.target.value)}
                              className="flex-1"
                            />
                            <Button 
                              variant="outline" 
                              onClick={handleTestEmail}
                              disabled={loading.testingEmail}
                              className="flex items-center gap-2"
                            >
                              {loading.testingEmail ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="h-4 w-4" />
                              )}
                              Testar
                            </Button>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button 
                            onClick={handleSaveEmailConfig} 
                            disabled={loading.savingConfig}
                            className="flex items-center gap-2"
                          >
                            {loading.savingConfig ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            Salvar Configurações
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={loadEmailConfig}
                            disabled={loading.loadingConfig}
                            className="flex items-center gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Recarregar
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configurações de Notificações */}
              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Configurações de Notificações
                    </CardTitle>
                    <CardDescription>
                      Configure como e quando receber notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                          <p className="text-sm text-gray-600">Receber notificações via e-mail</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, emailNotifications: checked})
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                          <p className="text-sm text-gray-600">Receber notificações via SMS</p>
                        </div>
                        <Switch
                          id="sms-notifications"
                          checked={notificationSettings.smsNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, smsNotifications: checked})
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push-notifications">Notificações Push</Label>
                          <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, pushNotifications: checked})
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="contract-reminders">Lembretes de Contratos</Label>
                          <p className="text-sm text-gray-600">Avisos sobre vencimentos de contratos</p>
                        </div>
                        <Switch
                          id="contract-reminders"
                          checked={notificationSettings.contractReminders}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, contractReminders: checked})
                          }
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="payment-reminders">Lembretes de Pagamento</Label>
                          <p className="text-sm text-gray-600">Avisos sobre pagamentos em atraso</p>
                        </div>
                        <Switch
                          id="payment-reminders"
                          checked={notificationSettings.paymentReminders}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, paymentReminders: checked})
                          }
                        />
                      </div>
                    </div>
                    <Button onClick={() => handleSave("notificações")} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configurações do Sistema */}
              <TabsContent value="system" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações do Sistema
                    </CardTitle>
                    <CardDescription>
                      Configure preferências gerais do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select value={systemSettings.timezone} onValueChange={(value) => 
                          setSystemSettings({...systemSettings, timezone: value})
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                            <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={systemSettings.language} onValueChange={(value) => 
                          setSystemSettings({...systemSettings, language: value})
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Moeda</Label>
                        <Select value={systemSettings.currency} onValueChange={(value) => 
                          setSystemSettings({...systemSettings, currency: value})
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BRL">Real (R$)</SelectItem>
                            <SelectItem value="USD">Dólar ($)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-format">Formato de Data</Label>
                        <Select value={systemSettings.dateFormat} onValueChange={(value) => 
                          setSystemSettings({...systemSettings, dateFormat: value})
                        }>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                            <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-mode">Modo de Manutenção</Label>
                        <p className="text-sm text-gray-600">Ativar modo de manutenção do sistema</p>
                      </div>
                      <Switch
                        id="maintenance-mode"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, maintenanceMode: checked})
                        }
                      />
                    </div>
                    <Button onClick={() => handleSave("sistema")} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Configurações de Segurança */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Configurações de Segurança
                    </CardTitle>
                    <CardDescription>
                      Configure as políticas de segurança do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
                          <p className="text-sm text-gray-600">Adicionar camada extra de segurança</p>
                        </div>
                        <Switch
                          id="two-factor"
                          checked={securitySettings.twoFactorAuth}
                          onCheckedChange={(checked) => 
                            setSecuritySettings({...securitySettings, twoFactorAuth: checked})
                          }
                        />
                      </div>
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                          <Input
                            id="session-timeout"
                            type="number"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-attempts">Tentativas de Login</Label>
                          <Input
                            id="login-attempts"
                            type="number"
                            value={securitySettings.loginAttempts}
                            onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleSave("segurança")} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integrações */}
              <TabsContent value="integrations" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Integrações
                    </CardTitle>
                    <CardDescription>
                      Configure integrações com serviços externos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                            <div>
                              <h3 className="font-semibold">Asaas</h3>
                              <p className="text-sm text-gray-600">Gateway de pagamento</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            Configurar
                          </Button>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Mail className="h-6 w-6 text-green-600" />
                            <div>
                              <h3 className="font-semibold">WhatsApp Business</h3>
                              <p className="text-sm text-gray-600">Mensagens automáticas</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            Configurar
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Configuracoes;