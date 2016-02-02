<?php
echo "Parameter:".$argv[1]."\n";
echo "Directory content...\n\n";

$output="";
if ($hnd = opendir('.'))
{
  while($file = readdir($hnd))
  {
    if ($file == "." || $file == "..") continue;
    $output .= "$file\n";
  }
  closedir($hnd);
}
echo $output;
?>

