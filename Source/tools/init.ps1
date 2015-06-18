param($installPath, $toolsPath, $package, $project)

# There is no equivalent uninstall because NuGet does not support it: http://nuget.codeplex.com/workitem/2074

$sourceRootPath = (get-item $installPath).parent.parent.FullName
$projectExtensionFilePath = "$sourceRootPath\.build\JavaScriptTests.ProjectExtension.targets"

new-item -itemtype directory -force -path "$sourceRootPath\.build\" | out-null
copy-item "$installPath\JavaScriptTests.ProjectExtension.targets" $projectExtensionFilePath -force

$fullTargetsFilePath = resolve-path (join-path $installPath "JavaScriptTests.targets")

$originalPath = get-location
set-location "$sourceRootPath\.build\"
$relativeTargetsFilePath = get-item $fullTargetsFilePath | resolve-path -relative
set-location $originalPath

# Update copied project extension file to point back to packages directory for everything else
$projectExtension = new-object XML
$projectExtension.Load($projectExtensionFilePath)
$projectExtension.Project.Import.Project = "$relativeTargetsFilePath"
$projectExtension.Save($projectExtensionFilePath)