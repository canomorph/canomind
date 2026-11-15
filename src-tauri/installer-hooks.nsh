!macro NSIS_HOOK_POSTINSTALL
  MessageBox MB_YESNO|MB_ICONQUESTION "Associate .canomind files with CanoMind?$\r$\n.canomind dosyaları CanoMind ile ilişkilendirilsin mi?" IDNO canomind_skip_assoc
    WriteRegStr SHCTX "Software\Classes\.canomind" "" "CanoMind.Document"
    WriteRegStr SHCTX "Software\Classes\CanoMind.Document" "" "CanoMind Document"
    WriteRegStr SHCTX "Software\Classes\CanoMind.Document\DefaultIcon" "" "$INSTDIR\${MAINBINARYNAME}.exe,0"
    WriteRegStr SHCTX "Software\Classes\CanoMind.Document\shell\open\command" "" '"$INSTDIR\${MAINBINARYNAME}.exe" "%1"'
    System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
  canomind_skip_assoc:
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  DeleteRegKey SHCTX "Software\Classes\.canomind"
  DeleteRegKey SHCTX "Software\Classes\CanoMind.Document"
  System::Call 'shell32::SHChangeNotify(i 0x08000000, i 0, p 0, p 0)'
!macroend
