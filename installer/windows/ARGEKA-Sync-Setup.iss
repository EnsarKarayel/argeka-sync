#define MyAppName "ARGEKA Sync"
#define MyAppVersion "0.3.0"
#define MyAppPublisher "ARGEKA"
#define MyAppURL "https://argeka.com.tr"

[Setup]
AppId={{B1F9E3DE-04D0-4E5C-9DC8-8F88D8C9A130}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}/support.html
DefaultDirName={autopf}\ARGEKA Sync
DefaultGroupName=ARGEKA Sync
OutputBaseFilename=ARGEKA-Sync-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin

[Files]
Source: "..\..\downloads\ARGEKA-Sync-Setup.cmd"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\downloads\ARGEKA-Sync-Setup-TR.cmd"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\downloads\ARGEKA-Sync-Setup-EN.cmd"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\ARGEKA Sync Kur"; Filename: "{app}\ARGEKA-Sync-Setup.cmd"
Name: "{commondesktop}\ARGEKA Sync Kur"; Filename: "{app}\ARGEKA-Sync-Setup.cmd"

[Run]
Filename: "{app}\ARGEKA-Sync-Setup.cmd"; Description: "ARGEKA Sync kurulumunu baslat"; Flags: postinstall nowait skipifsilent
